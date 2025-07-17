import { UserIcon } from "@heroicons/react/24/outline";

export default function NavBar() {
    return (
        <nav className="w-screen bg-blue-600 px-6 py-4 flex items-center justify-between">
            <div className="text-white font-bold text-xl">ABDUL</div>
            <div className="flex">
                <UserIcon className="h-6 w-6 text-white" />
                    <a href="#" className="text-white hover:text-blue-200 transition">Admin</a>
            </div>
        </nav>
    );
}