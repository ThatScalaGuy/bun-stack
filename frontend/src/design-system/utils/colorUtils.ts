/**
 * Convert hex color to RGBA
 * @param hex Hex color string (e.g. #ffffff or #fff)
 * @param alpha Alpha value (0-1)
 * @returns RGBA color string
 */
export const hexToRgba = (hex: string, alpha = 1): string => {
    // Remove the hash if it exists
    hex = hex.replace('#', '');

    // If the hex is in shorthand form (e.g. #fff), convert it to full form
    if (hex.length === 3) {
        hex = hex
            .split('')
            .map((char) => char + char)
            .join('');
    }

    // Convert hex to RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Return RGBA string
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Darken a color by a specified amount
 * @param hex Hex color string (e.g. #ffffff or #fff)
 * @param amount Amount to darken (0-1)
 * @returns Darkened hex color string
 */
export const darken = (hex: string, amount = 0.1): string => {
    // Remove the hash if it exists
    hex = hex.replace('#', '');

    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    r = Math.max(0, Math.floor(r * (1 - amount)));
    g = Math.max(0, Math.floor(g * (1 - amount)));
    b = Math.max(0, Math.floor(b * (1 - amount)));

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

/**
 * Lighten a color by a specified amount
 * @param hex Hex color string (e.g. #ffffff or #fff)
 * @param amount Amount to lighten (0-1)
 * @returns Lightened hex color string
 */
export const lighten = (hex: string, amount = 0.1): string => {
    // Remove the hash if it exists
    hex = hex.replace('#', '');

    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    r = Math.min(255, Math.floor(r + (255 - r) * amount));
    g = Math.min(255, Math.floor(g + (255 - g) * amount));
    b = Math.min(255, Math.floor(b + (255 - b) * amount));

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};
