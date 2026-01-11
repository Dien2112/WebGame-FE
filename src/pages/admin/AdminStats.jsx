export default function AdminStats() {
    return (
        <div>
            <h3 className="text-2xl font-bold mb-4">System Statistics</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="p-6 border rounded-lg shadow-sm">
                    <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold">1,234</p>
                </div>
                <div className="p-6 border rounded-lg shadow-sm">
                    <p className="text-sm font-medium text-muted-foreground">Active Games</p>
                    <p className="text-2xl font-bold">56</p>
                </div>
            </div>
        </div>
    );
}
