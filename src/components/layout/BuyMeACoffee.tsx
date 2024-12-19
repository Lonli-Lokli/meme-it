export function BuyMeACoffee() {
    return (
        <a
        href="https://www.buymeacoffee.com/LonliLokliV"
        target="_blank"
        rel="noopener noreferrer"
        className="h-8 px-2 border rounded hover:bg-accent transition-colors flex items-center gap-1"
      >
        <span role="img" aria-label="coffee">☕️</span>
        <span className="hidden sm:inline">Buy me a coffee</span>
      </a>
      
    );
  }