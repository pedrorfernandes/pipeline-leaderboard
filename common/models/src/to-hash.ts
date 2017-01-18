/* tslint:disable:no-bitwise */
export function stringToHash(s: string): number {
    let hash = 0;
    let i = 0;
    let l = s.length;
    let char;

    for (; i < l; i++) {
        char = s.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }

    return hash;
};