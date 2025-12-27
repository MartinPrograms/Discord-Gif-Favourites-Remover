// Removes all favorite GIFs from a Discord protobuf-encoded buffer
// Yes this code is AI-generated, I could not be bothered doing this myself.

// Thanks to https://gist.github.com/browningluke/4a009b2ebba1538eafaa1420eedcbced for the protobuf fields
const GIFS_FIELD_NUMBER = 2;
const FAVORITES_FIELD_NUMBER = 1;
const WIRE_TYPE_LENGTH_DELIMITED = 2;

// Simple varint read
function readVarint(buf, offset) {
  let result = 0;
  let shift = 0;
  let pos = offset;
  let b;
  do {
    b = buf[pos++];
    result |= (b & 0x7f) << shift;
    shift += 7;
  } while (b & 0x80);
  return { value: result, bytesRead: pos - offset };
}

// Remove a repeated field inside a length-delimited submessage
function removeRepeatedFieldFromSubmessage(subBuf, fieldNumber, wireType) {
  const out = Buffer.allocUnsafe(subBuf.length);
  let inPos = 0;
  let outPos = 0;

  while (inPos < subBuf.length) {
    const key = subBuf[inPos++];
    const field = key >> 3;
    const type = key & 0x07;

    if (field === fieldNumber && type === wireType) {
      // read length
      const { value: len, bytesRead } = readVarint(subBuf, inPos);
      inPos += bytesRead + len; // skip this repeated entry
      continue; // omit
    } else {
      // copy key
      out[outPos++] = key;
      switch (type) {
        case 0: { // varint
          let b;
          do {
            b = subBuf[inPos++];
            out[outPos++] = b;
          } while (b & 0x80);
          break;
        }
        case 1: // 64-bit
          subBuf.copy(out, outPos, inPos, inPos + 8);
          outPos += 8;
          inPos += 8;
          break;
        case 2: { // length-delimited
          const { value: len2, bytesRead: br2 } = readVarint(subBuf, inPos);
          // copy varint length bytes
          subBuf.copy(out, outPos, inPos, inPos + br2);
          outPos += br2;
          inPos += br2;
          // copy data
          subBuf.copy(out, outPos, inPos, inPos + len2);
          outPos += len2;
          inPos += len2;
          break;
        }
        case 5: // 32-bit
          subBuf.copy(out, outPos, inPos, inPos + 4);
          outPos += 4;
          inPos += 4;
          break;
        default:
          throw new Error(`Unsupported wire type: ${type}`);
      }
    }
  }
  return out.subarray(0, outPos);
}

// Top-level scan
export function removeFavourites(buf) {
  const out = Buffer.allocUnsafe(buf.length);
  let inPos = 0;
  let outPos = 0;

  while (inPos < buf.length) {
    const key = buf[inPos++];
    const field = key >> 3;
    const type = key & 0x07;

    if (field === GIFS_FIELD_NUMBER && type === WIRE_TYPE_LENGTH_DELIMITED) {
      // read length
      const { value: len, bytesRead } = readVarint(buf, inPos);
      const lengthVarintPos = inPos;
      inPos += bytesRead;
      const subBuf = buf.slice(inPos, inPos + len);

      // remove repeated favorites inside gifs
      const newSubBuf = removeRepeatedFieldFromSubmessage(subBuf, FAVORITES_FIELD_NUMBER, WIRE_TYPE_LENGTH_DELIMITED);

      // write key
      out[outPos++] = key;

      // write new length (varint)
      let remaining = newSubBuf.length;
      do {
        let byte = remaining & 0x7f;
        remaining >>>= 7;
        if (remaining !== 0) byte |= 0x80;
        out[outPos++] = byte;
      } while (remaining !== 0);

      // write new sub-buffer
      newSubBuf.copy(out, outPos);
      outPos += newSubBuf.length;

      inPos += len;
    } else {
      // copy key
      out[outPos++] = key;
      switch (type) {
        case 0: { // varint
          let b;
          do {
            b = buf[inPos++];
            out[outPos++] = b;
          } while (b & 0x80);
          break;
        }
        case 1: // 64-bit
          buf.copy(out, outPos, inPos, inPos + 8);
          outPos += 8;
          inPos += 8;
          break;
        case 2: { // length-delimited
          const { value: len2, bytesRead: br2 } = readVarint(buf, inPos);
          // copy varint length bytes
          buf.copy(out, outPos, inPos, inPos + br2);
          outPos += br2;
          inPos += br2;
          // copy data
          buf.copy(out, outPos, inPos, inPos + len2);
          outPos += len2;
          inPos += len2;
          break;
        }
        case 5: // 32-bit
          buf.copy(out, outPos, inPos, inPos + 4);
          outPos += 4;
          inPos += 4;
          break;
        default:
          throw new Error(`Unsupported wire type: ${type}`);
      }
    }
  }

  return out.subarray(0, outPos);
}