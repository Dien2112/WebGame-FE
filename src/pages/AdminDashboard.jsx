export default function AdminDashboard() {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
            <p>This is Admin Dashboard page</p>
            <div className="grid gap-4 md:grid-cols-3 mt-4">
                <div className="p-4 border rounded">Manage Users</div>
                <div className="p-4 border rounded">System Stats</div>
                <div className="p-4 border rounded">Game Settings</div>
            </div>
        </div>
    );
}
