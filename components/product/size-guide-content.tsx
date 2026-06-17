const shoeRows = [
  ["36", "3", "5", "23.0"],
  ["37", "4", "6", "23.7"],
  ["38", "5", "7", "24.4"],
  ["39", "6", "7.5", "25.1"],
  ["40", "6.5", "8", "25.8"],
  ["41", "7.5", "9", "26.5"],
  ["42", "8", "9.5", "27.1"],
  ["43", "9", "10.5", "27.8"],
  ["44", "9.5", "11", "28.5"],
  ["45", "10.5", "12", "29.2"],
];

const clothingRows = [
  ["XS", "44", "34", "86"],
  ["S", "46", "36", "91"],
  ["M", "48", "38", "96"],
  ["L", "50", "40", "101"],
  ["XL", "52", "42", "106"],
  ["XXL", "54", "44", "111"],
];

export function SizeGuideContent({ category }: { category: string }) {
  const isShoes = category === "shoes";
  const headers = isShoes
    ? ["EU", "UK", "US", "Foot (cm)"]
    : ["Size", "EU", "UK", "Chest (cm)"];
  const rows = isShoes ? shoeRows : clothingRows;

  return (
    <div>
      <h3 className="font-serif text-xl text-foreground">
        {isShoes ? "Shoe size guide" : "Clothing size guide"}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        {isShoes
          ? "Measure your foot from heel to longest toe, standing, in the evening."
          : "Measure around the fullest part of your chest, keeping the tape level."}
      </p>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[24rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              {headers.map((h) => (
                <th key={h} className="py-2.5 pr-4 font-medium text-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r[0]} className="border-b border-border/60 text-muted-foreground">
                {r.map((c, i) => (
                  <td key={i} className={i === 0 ? "py-2.5 pr-4 font-medium text-foreground" : "py-2.5 pr-4"}>{c}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Between sizes? We recommend sizing up for a relaxed fit.
      </p>
    </div>
  );
}
