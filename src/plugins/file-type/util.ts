export function stringToBytes(text: string) {
  return [...text].map(character => character.charCodeAt(0));
}

// tslint:disable-next-line: no-any
export function uint8ArrayUtf8ByteString(array: Uint8Array, start: number, end: number) {
  return String.fromCharCode(...array.slice(start, end));
};

export function readUInt64LE(buffer: Uint8Array, offset = 0) {

  let n = buffer[offset];
  let mul = 1;
  let i = 0;

  while (i + 1 < 8) {

    i += 1;

    mul *= 0x100;
    n += buffer[offset + i] * mul;

  }

  return n;

};

export function tarHeaderChecksumMatches(buffer: Uint8Array) {

  if (buffer.length < 512) {
    return false;
  }

  const MASK_8TH_BIT = 0x80;

  let sum = 256;
  let signedBitSum = 0;

  for (let i = 0; i < 148; i++) {
    const byte = buffer[i];
    sum += byte;
    signedBitSum += byte & MASK_8TH_BIT;
  }

  for (let i = 156; i < 512; i++) {
    const byte = buffer[i];
    sum += byte;
    signedBitSum += byte & MASK_8TH_BIT;
  }

  const readSum = parseInt(uint8ArrayUtf8ByteString(buffer, 148, 154), 8);

  return (
    readSum === sum ||
    readSum === (sum - (signedBitSum << 1))
  );

};

export function multiByteIndexOf(buffer: Uint8Array, bytesToSearch: Uint8Array | number[], startAt = 0) {

  if (Buffer && Buffer.isBuffer(buffer)) {
    return buffer.indexOf(Buffer.from(bytesToSearch as Buffer), startAt);
  }

  const nextBytesMatch = (buffer2: Uint8Array, bytes: Uint8Array | number[], startIndex: number) => {

    for (let i = 1; i < bytes.length; i++) {
      if (bytes[i] !== buffer2[startIndex + i]) {
        return false;
      }
    }

    return true;

  };

  let index = buffer.indexOf(bytesToSearch[0], startAt);

  while (index >= 0) {

    if (nextBytesMatch(buffer, bytesToSearch, index)) {
      return index;
    }

    index = buffer.indexOf(bytesToSearch[0], index + 1);

  }

  return -1;

};
