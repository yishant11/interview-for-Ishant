"use client";
import { useState, useEffect } from "react";

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

            const launchesData = await launchesRes.json();
            const rocketsData = await rocketsRes.json();
            const launchpadsData = await launchpadsRes.json();
            const payloadsData = await payloadsRes.json();

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
                <p>Total launches fetched: {launches.length}</p>
            </div>
        </div>
    );
}
