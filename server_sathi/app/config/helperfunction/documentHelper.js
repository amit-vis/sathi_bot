import { Prisma } from "@prisma/client";
export const parseDate = (raw) => {
    if (!raw)
        return null;
    const s = raw.trim()?.replace(/(\d+)(st|nd|rd|th)/gi, "$1");
    let m = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
    if (m)
        return toUtc(+m[1], +m[2], +m[3]);
    m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/);
    if (m) {
        const year = m[3].length === 2 ? 2000 + +m[3] : +m[3];
        return toUtc(year, +m[2], +m[1]);
    }
    m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/);
    if (m) {
        const mo = monthIndex(m[2]);
        if (mo)
            return toUtc(+m[3], mo, +m[1]);
    }
    m = s.match(/^([A-Za-z]+)\.?\s+(\d{1,2}),?\s+(\d{4})$/);
    if (m) {
        const mo = monthIndex(m[1]);
        if (mo)
            return toUtc(+m[3], mo, +m[2]);
    }
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
};
const toUtc = (y, mo, d) => {
    if (mo < 1 || mo > 12 || d < 1 || d > 31)
        return null;
    return new Date(Date.UTC(y, mo - 1, d));
};
const monthIndex = (name) => {
    const m = name.slice(0, 3).toLowerCase();
    const idx = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].indexOf(m);
    return idx === -1 ? null : idx + 1;
};
export const dec = (n) => {
    return n === null || n === undefined ? null : new Prisma.Decimal(n);
};
//# sourceMappingURL=documentHelper.js.map