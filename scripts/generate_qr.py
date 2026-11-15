"""
Pure Python QR Code SVG Generator for Hackpixel.
Generates a valid, scannable QR Code SVG for BMC_URL without external dependencies.
"""
import math

class PureQR:
    # Standard QR Code parameters for Version 3 (29x29) Error Correction Level M
    # 70 data codewords (total), 44 data, 26 EC codewords
    
    @staticmethod
    def encode_url(url: str) -> list[list[int]]:
        """
        Creates a standard QR Code matrix for the URL.
        Version 3-M (29x29 matrix).
        """
        size = 29
        matrix = [[None for _ in range(size)] for _ in range(size)]
        reserved = [[False for _ in range(size)] for _ in range(size)]

        def set_func(r, c, val):
            matrix[r][c] = val
            reserved[r][c] = True

        # 1. Finder patterns (top-left, top-right, bottom-left)
        def add_finder(start_r, start_c):
            for r in range(7):
                for c in range(7):
                    if r in (0, 6) or c in (0, 6) or (2 <= r <= 4 and 2 <= c <= 4):
                        set_func(start_r + r, start_c + c, 1)
                    else:
                        set_func(start_r + r, start_c + c, 0)
            # Separators
            for r in range(-1, 8):
                for c in range(-1, 8):
                    rr, cc = start_r + r, start_c + c
                    if 0 <= rr < size and 0 <= cc < size and not reserved[rr][cc]:
                        set_func(rr, cc, 0)

        add_finder(0, 0)
        add_finder(0, size - 7)
        add_finder(size - 7, 0)

        # 2. Timing patterns
        for i in range(8, size - 8):
            if not reserved[6][i]:
                set_func(6, i, 1 if i % 2 == 0 else 0)
            if not reserved[i][6]:
                set_func(i, 6, 1 if i % 2 == 0 else 0)

        # 3. Alignment pattern at (22, 22) for Version 3
        align_r, align_c = 22, 22
        for r in range(-2, 3):
            for c in range(-2, 3):
                if max(abs(r), abs(c)) == 2 or (r == 0 and c == 0):
                    set_func(align_r + r, align_c + c, 1)
                else:
                    set_func(align_r + r, align_c + c, 0)

        # 4. Dark module
        set_func(4 * 3 + 9, 8, 1)

        # 5. Reserve format information areas
        for c in range(9):
            if not reserved[8][c]: reserved[8][c] = True
            if not reserved[c][8]: reserved[c][8] = True
        for c in range(size - 8, size):
            if not reserved[8][c]: reserved[8][c] = True
        for r in range(size - 7, size):
            if not reserved[r][8]: reserved[r][8] = True

        # Galois Field GF(256) math for Reed-Solomon EC
        exp_table = [0] * 512
        log_table = [0] * 256
        x = 1
        for i in range(255):
            exp_table[i] = x
            exp_table[i + 255] = x
            log_table[x] = i
            x = (x << 1) ^ (0x11d if (x & 0x80) else 0)

        def gf_mul(a, b):
            if a == 0 or b == 0: return 0
            return exp_table[log_table[a] + log_table[b]]

        def poly_mul(p1, p2):
            res = [0] * (len(p1) + len(p2) - 1)
            for i, c1 in enumerate(p1):
                for j, c2 in enumerate(p2):
                    res[i + j] ^= gf_mul(c1, c2)
            return res

        # Generator polynomial for 26 EC codewords (Version 3-M has 26 EC codewords)
        gen = [1]
        for i in range(26):
            gen = poly_mul(gen, [1, exp_table[i]])

        # Data stream: Byte Mode (0100) + 8-bit count + payload + terminator (0000)
        bits = "0100" + f"{len(url):08b}"
        for ch in url.encode("utf-8"):
            bits += f"{ch:08b}"
        bits += "0000"
        while len(bits) % 8 != 0:
            bits += "0"
        
        # Pad bytes to 44 data codewords
        pad_bytes = ["11101100", "00010001"] # 0xEC, 0x11
        data_bytes = []
        for i in range(0, len(bits), 8):
            data_bytes.append(int(bits[i:i+8], 2))
        
        pad_idx = 0
        while len(data_bytes) < 44:
            data_bytes.append(int(pad_bytes[pad_idx % 2], 2))
            pad_idx += 1

        # Compute Reed-Solomon 26 error correction codewords
        msg = data_bytes + [0] * 26
        for i in range(len(data_bytes)):
            coef = msg[i]
            if coef != 0:
                for j in range(len(gen)):
                    msg[i + j] ^= gf_mul(gen[j], coef)
        ec_codewords = msg[len(data_bytes):]
        all_codewords = data_bytes + ec_codewords

        # Convert codewords to bitstream
        final_bits = "".join(f"{b:08b}" for b in all_codewords) + "0000000"

        # Place data bits using standard upward/downward zigzag pattern
        bit_idx = 0
        r, c = size - 1, size - 1
        dir_up = True

        while c > 0:
            if c == 6:  # Skip vertical timing pattern column
                c -= 1
            for row_offset in range(size):
                curr_r = (size - 1 - row_offset) if dir_up else row_offset
                for col_offset in (0, 1):
                    curr_c = c - col_offset
                    if not reserved[curr_r][curr_c]:
                        if bit_idx < len(final_bits):
                            val = int(final_bits[bit_idx])
                            bit_idx += 1
                        else:
                            val = 0
                        # Apply standard Mask 000: (r + c) % 2 == 0
                        if (curr_r + curr_c) % 2 == 0:
                            val ^= 1
                        matrix[curr_r][curr_c] = val
            c -= 2
            dir_up = not dir_up

        # 6. Format string for Level M, Mask 0 (15 bits: 101010000010010)
        format_bits = "101010000010010"
        # Around top-left
        for i in range(6): set_func(8, i, int(format_bits[i]))
        set_func(8, 7, int(format_bits[6]))
        set_func(8, 8, int(format_bits[7]))
        set_func(7, 8, int(format_bits[8]))
        for i in range(9, 15): set_func(14 - i, 8, int(format_bits[i]))

        # Around top-right and bottom-left
        for i in range(8): set_func(8, size - 1 - i, int(format_bits[i]))
        for i in range(7): set_func(size - 7 + i, 8, int(format_bits[8 + i]))

        return matrix

    @staticmethod
    def to_svg(matrix: list[list[int]], module_size: int = 6, border: int = 4) -> str:
        size = len(matrix)
        total_size = (size + border * 2) * module_size
        rects = []
        for r in range(size):
            for c in range(size):
                if matrix[r][c] == 1:
                    x = (c + border) * module_size
                    y = (r + border) * module_size
                    rects.append(f'<rect x="{x}" y="{y}" width="{module_size}" height="{module_size}" fill="#89cff0"/>')

        svg = [
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {total_size} {total_size}" width="{total_size}" height="{total_size}" shape-rendering="crispEdges">',
            f'  <rect width="100%" height="100%" fill="#0a0e14"/>',
            '  ' + '\n  '.join(rects),
            '</svg>'
        ]
        return '\n'.join(svg)


if __name__ == "__main__":
    url = "https://buymeacoffee.com/luthfanmakl"
    mat = PureQR.encode_url(url)
    svg_content = PureQR.to_svg(mat, module_size=6, border=4)
    out_path = r"c:\Users\Lutfan\OneDrive\Desktop\Deadline Decoder\static\bmc-qr.svg"
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(svg_content)
    print(f"Generated QR code SVG successfully at: {out_path}")
