const outlineAssets = import.meta.glob("../assets/*-outline.{png,jpg,jpeg}", {
  eager: true,
  import: "default",
});

const drawings: Record<string, { imageUrl: string }> = {};

for (const [path, imageUrl] of Object.entries(outlineAssets)) {
  // Extract filename: ../assets/BaliRiceField-outline.jpg -> BaliRiceField
  const filename = path.split("/").pop()!;
  const key = filename.replace(/-outline\.(png|jpg|jpeg)$/, "");

  drawings[key] = {
    imageUrl: imageUrl as string,
  };
}

export const Drawings = drawings;
