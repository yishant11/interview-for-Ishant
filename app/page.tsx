"use client";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    patch: { small: string | null; large: string | null };
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
    if (launch.upcoming) {
      return (
        <Badge
          variant="outline"
          className="bg-yellow-50 text-yellow-700 border-yellow-200"
        >
          Upcoming
        </Badge>
      );
    }
    if (launch.success === true) {
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-600 border-green-300"
        >
          Success
        </Badge>
      );
    }
    if (launch.success === false) {
      return (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 border-red-200"
        >
          Failed
        </Badge>
      );
    }
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

  const paginatedLaunches = launches.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(launches.length / itemsPerPage);

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
        <div className="overflow-x-auto mt-6">
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
                <tr key={launch.id} className="hover:bg-gray-50">
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
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  aria-label="Go to previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  aria-label="Go to next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
