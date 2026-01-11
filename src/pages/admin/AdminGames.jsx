export default function AdminGames() {
    return (
        <div>
            <h3 className="text-2xl font-bold mb-4">Game Configurations</h3>
            <p>Configure game settings (win conditions, timeouts).</p>
            <div className="grid gap-4 mt-4">
                <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Caro</h4>
                    <p className="text-sm">Board Size: 15x15</p>
                </div>
            </div>
        </div>
    );
}
