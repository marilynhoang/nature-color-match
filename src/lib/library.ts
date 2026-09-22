import { get, set } from "idb-keyval";
import { useCallback, useEffect, useState } from "react";
import type { PaletteColor } from "./extractPalette";

export type Palette = {
  id: string;
  name: string;
  catalogNo: number;
  createdAt: string; // ISO date
  colors: PaletteColor[];
  imageDataUrl: string;
};

const STORE_KEY = "nature-palette:library";

const SPECIES_NAMES = [
  "Begonia Rex",
  "Coleus",
  "Orchid Mantis",
  "Rainbow Eucalyptus",
  "Moss Agate",
  "Poison Dart Frog",
  "Peacock Feather",
  "Sea Glass",
  "Autumn Maple",
  "Desert Sage",
];

function randomName(existingCount: number) {
  return SPECIES_NAMES[existingCount % SPECIES_NAMES.length];
}

async function loadAll(): Promise<Palette[]> {
  const data = await get<Palette[]>(STORE_KEY);
  return data ?? [];
}

async function saveAll(palettes: Palette[]) {
  await set(STORE_KEY, palettes);
}

export async function addPalette(input: {
  colors: PaletteColor[];
  imageDataUrl: string;
}): Promise<Palette> {
  const all = await loadAll();
  const palette: Palette = {
    id: crypto.randomUUID(),
    name: randomName(all.length),
    catalogNo: all.length + 1,
    createdAt: new Date().toISOString(),
    colors: input.colors,
    imageDataUrl: input.imageDataUrl,
  };
  await saveAll([palette, ...all]);
  return palette;
}

export async function removePalette(id: string) {
  const all = await loadAll();
  await saveAll(all.filter((p) => p.id !== id));
}

export async function renamePalette(id: string, name: string) {
  const all = await loadAll();
  await saveAll(all.map((p) => (p.id === id ? { ...p, name } : p)));
}

export function formatDate(iso: string) {
  return new Date(iso)
    .toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    .toLowerCase();
}

/** Loads and mutates the palette library, backed by IndexedDB. Swapping
 * this hook's internals for a real backend later is the only change needed
 * to move off browser-only storage. */
export function usePaletteLibrary() {
  const [palettes, setPalettes] = useState<Palette[] | null>(null);

  const refresh = useCallback(async () => {
    const all = await loadAll();
    setPalettes(all);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const add = useCallback(
    async (input: { colors: PaletteColor[]; imageDataUrl: string }) => {
      const palette = await addPalette(input);
      await refresh();
      return palette;
    },
    [refresh]
  );

  const remove = useCallback(
    async (id: string) => {
      await removePalette(id);
      await refresh();
    },
    [refresh]
  );

  const rename = useCallback(
    async (id: string, name: string) => {
      await renamePalette(id, name);
      await refresh();
    },
    [refresh]
  );

  return { palettes, loading: palettes === null, add, remove, rename, refresh };
}
