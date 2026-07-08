export function Footer() {
  return (
    <footer className="border-t border-gray-800 py-6">
      <div className="mx-auto max-w-3xl px-4 text-center text-xs text-gray-500 space-y-1">
        <p>
          Splitpot · Tether Developers Cup · track:{" "}
          <span className="text-gray-400">WDK</span>
        </p>
        <p>
          Built with{" "}
          <a
            href="https://wdk.tether.io"
            className="text-emerald-500 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            @tetherto/wdk
          </a>{" "}
          · Apache 2.0
        </p>
      </div>
    </footer>
  )
}
