"use client";
import { useState, useEffect } from "react";
import {
  ChevronDown,
  Filter,
  ChevronLeft,
  ChevronRight,
  Youtube,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";

interface Launch {
  id: string;
  flight_number: number;
  name: string;
  date_utc: string;
  date_local: string;
  success: boolean | null;
  upcoming: boolean;
  rocket: string;
  launchpad: string;
  details: string | null;
  links: {
    patch: {
      small: string | null;
      large: string | null;
    };
    webcast: string | null;
    wikipedia: string | null;
  };
  payloads: string[];
}
interface Rocket {
  id: string;
  name: string;
  type: string;
  description: string;
}
interface Launchpad {
  id: string;
  name: string;
  full_name: string;
  locality: string;
  region: string;
}
interface Payload {
  id: string;
  name: string;
  type: string;
  orbit: string;
  mass_kg: number | null;
}

export default function SpaceXDashboard() {
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [rockets, setRockets] = useState<Record<string, Rocket>>({});
  const [launchpads, setLaunchpads] = useState<Record<string, Launchpad>>({});
  const [payloads, setPayloads] = useState<Record<string, Payload>>({});
  const [loading, setLoading] = useState(true);
  const [selectedLaunch, setSelectedLaunch] = useState<Launch | null>(null);
  const [filter, setFilter] = useState("All Launches");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [launchesRes, rocketsRes, launchpadsRes, payloadsRes] =
        await Promise.all([
          fetch("https://api.spacexdata.com/v5/launches"),
          fetch("https://api.spacexdata.com/v4/rockets"),
          fetch("https://api.spacexdata.com/v4/launchpads"),
          fetch("https://api.spacexdata.com/v4/payloads"),
        ]);
      const [launchesData, rocketsData, launchpadsData, payloadsData] =
        await Promise.all([
          launchesRes.json(),
          rocketsRes.json(),
          launchpadsRes.json(),
          payloadsRes.json(),
        ]);

      const createMap = <T extends { id: string }>(
        items: T[]
      ): Record<string, T> =>
        items.reduce((acc, item) => {
          acc[item.id] = item;
          return acc;
        }, {} as Record<string, T>);

      setLaunches(
        launchesData.sort(
          (a: Launch, b: Launch) =>
            new Date(b.date_utc).getTime() - new Date(a.date_utc).getTime()
        )
      );
      setRockets(createMap(rocketsData));
      setLaunchpads(createMap(launchpadsData));
      setPayloads(createMap(payloadsData));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (launch: Launch) => {
    if (launch.upcoming)
      return (
        <Badge
          variant="outline"
          className="bg-yellow-50 text-yellow-700 border-yellow-200"
        >
          Upcoming
        </Badge>
      );
    if (launch.success === true)
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-600 border-green-300"
        >
          Success
        </Badge>
      );
    if (launch.success === false)
      return (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 border-red-200"
        >
          Failed
        </Badge>
      );
    return (
      <Badge
        variant="outline"
        className="bg-gray-50 text-gray-700 border-gray-200"
      >
        Unknown
      </Badge>
    );
  };

  const formatDate = (dateString: string) =>
    format(new Date(dateString), "dd MMM yyyy HH:mm");

  const filteredLaunches = launches.filter((launch) => {
    if (filter === "Upcoming Launches" && !launch.upcoming) return false;
    if (filter === "Successful Launches" && launch.success !== true)
      return false;
    if (filter === "Failed Launches" && launch.success !== false) return false;
    return true;
  });

  const paginatedLaunches = filteredLaunches.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredLaunches.length / itemsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-2 border-b w-full ">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPzK9Cf01wkBUz2S8RiApK1B_jNTsvxPm4mA&s"
            alt="SpaceX Logo"
            className="h-[3rem] w-[15rem] object-cover mx-auto "
          />
        </div>

        <div className="p-6 border-b">
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  {filter}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilter("All Launches")}>
                  All Launches
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setFilter("Upcoming Launches")}
                >
                  Upcoming Launches
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setFilter("Successful Launches")}
                >
                  Successful Launches
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("Failed Launches")}>
                  Failed Launches
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {filteredLaunches.length === 0 ? (
          <div className="py-32 text-center">
            <p className="text-gray-500">No results found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Launched (UTC)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mission
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orbit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Launch Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rocket
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedLaunches.map((launch, index) => (
                    <tr
                      key={launch.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedLaunch(launch)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {String(
                          (currentPage - 1) * itemsPerPage + index + 1
                        ).padStart(2, "0")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(launch.date_utc)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {launchpads[launch.launchpad]?.name || "Unknown"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {launch.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payloads[launch.payloads[0]]?.orbit || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(launch)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {rockets[launch.rocket]?.name || "Unknown"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-6 py-4 border-t">
                <div className="flex items-end justify-end">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Dialog
        open={!!selectedLaunch}
        onOpenChange={() => setSelectedLaunch(null)}
      >
        <DialogContent className="w-full h-[36.5rem] p-0 rounded-md">
          {selectedLaunch && (
            <>
              <DialogHeader className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    {selectedLaunch.links.patch.small && (
                      <img
                        src={selectedLaunch.links.patch.small}
                        alt="Mission patch"
                        className="w-16 h-16 rounded-md"
                      />
                    )}
                    <div>
                      <DialogTitle className="text-2xl font-bold">
                        {selectedLaunch.name}
                      </DialogTitle>
                      <p className="text-sm text-gray-500 text-start">
                        {rockets[selectedLaunch.rocket]?.name ||
                          "Unknown Rocket"}
                      </p>
                      <div className="flex items-center space-x-4 pt-2">
                        {selectedLaunch.links.webcast && (
                          <a
                            href={selectedLaunch.links.webcast}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-sm text-gray-600 hover:text-red-600 transition-colors"
                          >
                            <Youtube className="w-4 h-4 mr-1.5" />
                            <span>Webcast</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(selectedLaunch)}
                </div>
              </DialogHeader>

              <div className="px-6 pb-4 space-y-6">
                {selectedLaunch.details && (
                  <p className="text-sm text-gray-700 leading-relaxed border-t pt-6">
                    {selectedLaunch.details}
                    {selectedLaunch.links.wikipedia && (
                      <a
                        href={selectedLaunch.links.wikipedia}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 font-semibold hover:underline ml-1"
                      >
                        Wikipedia
                      </a>
                    )}
                  </p>
                )}
                <div className="space-y-3 text-sm pt-1 border-t">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-500">
                      Flight Number
                    </span>
                    <span className="text-gray-900">
                      {selectedLaunch.flight_number}
                    </span>
                  </div>
                  <div className="border-t"></div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-500">
                      Mission Name
                    </span>
                    <span className="text-gray-900">{selectedLaunch.name}</span>
                  </div>
                  <div className="border-t"></div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-500">
                      Rocket Type
                    </span>
                    <span className="text-gray-900">
                      {rockets[selectedLaunch.rocket]?.type || "Unknown"}
                    </span>
                  </div>
                  <div className="border-t"></div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-500">
                      Rocket Name
                    </span>
                    <span className="text-gray-900">
                      {rockets[selectedLaunch.rocket]?.name || "Unknown"}
                    </span>
                  </div>
                  <div className="border-t"></div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-500">
                      Launch Date
                    </span>
                    <span className="text-gray-900">
                      {formatDate(selectedLaunch.date_utc)}
                    </span>
                  </div>
                  <div className="border-t"></div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-500">
                      Payload Type
                    </span>
                    <span className="text-gray-900">
                      {payloads[selectedLaunch.payloads[0]]?.type || "Unknown"}
                    </span>
                  </div>
                  <div className="border-t"></div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-500">Orbit</span>
                    <span className="text-gray-900">
                      {payloads[selectedLaunch.payloads[0]]?.orbit || "Unknown"}
                    </span>
                  </div>
                  <div className="border-t"></div>
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-gray-500">
                      Launch Site
                    </span>
                    <span className="text-gray-900 text-right">
                      {launchpads[selectedLaunch.launchpad]?.full_name ||
                        "Unknown"}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
