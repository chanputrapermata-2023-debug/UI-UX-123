"""Trace the committee's T-shirt template (assets/template-mockup-panitia.jpg)
into smooth vector paths so the mockup can be rendered crisp at any size."""
import json
import cv2
import numpy as np
from PIL import Image

SCALE = 4  # trace on an upscaled, blurred mask for sub-pixel smooth outlines

im = np.array(Image.open('assets/template-mockup-panitia.jpg').convert('RGB')).astype(int)
r, g, b = im[..., 0], im[..., 1], im[..., 2]
zone = np.zeros(im.shape[:2], np.uint8)
zone[195:860, 300:1620] = 1


def smooth_mask(m, sigma=1.3):
    m = cv2.resize(m.astype(np.uint8) * 255, None, fx=SCALE, fy=SCALE, interpolation=cv2.INTER_LINEAR)
    m = cv2.GaussianBlur(m, (0, 0), SCALE * sigma)
    return (m > 127).astype(np.uint8) * 255


def resample(c, step):
    # titik-titik berjarak sama sepanjang kontur, lalu dihaluskan (moving average melingkar)
    pts = c[:, 0, :].astype(float)
    seg = np.r_[0, np.cumsum(np.hypot(*np.diff(np.vstack([pts, pts[:1]]), axis=0).T))]
    n = max(8, int(seg[-1] / step))
    t = np.linspace(0, seg[-1], n, endpoint=False)
    closed = np.vstack([pts, pts[:1]])
    xs = np.interp(t, seg, closed[:, 0])
    ys = np.interp(t, seg, closed[:, 1])
    k = 2
    ker = np.ones(2 * k + 1) / (2 * k + 1)
    xs = np.convolve(np.r_[xs[-k:], xs, xs[:k]], ker, 'valid')
    ys = np.convolve(np.r_[ys[-k:], ys, ys[:k]], ker, 'valid')
    return np.c_[xs, ys]


def catmull_rom(p):
    # kurva Bezier kubik halus yang melewati setiap titik
    n = len(p)
    d = f'M{p[0][0]:.2f},{p[0][1]:.2f}'
    for i in range(n):
        p0, p1, p2, p3 = p[i - 1], p[i], p[(i + 1) % n], p[(i + 2) % n]
        c1 = p1 + (p2 - p0) / 6
        c2 = p2 - (p3 - p1) / 6
        d += f' C{c1[0]:.2f},{c1[1]:.2f} {c2[0]:.2f},{c2[1]:.2f} {p2[0]:.2f},{p2[1]:.2f}'
    return d + 'Z'


def to_path(contours, step=3.0, min_area=30):
    out = []
    for c in contours:
        if cv2.contourArea(c) < min_area * SCALE * SCALE:
            continue
        out.append(catmull_rom(resample(c, step * SCALE) / SCALE))
    return ' '.join(out)


# 1) silhouettes (fill holes: external contours only)
nonwhite = ((im.sum(2) < 660) & (zone > 0))
# bendera putih di tepi lengan template ikut "memotong" siluet; tambal mengikuti garis tepi lengan
for y in range(375, 460):
    nonwhite[y, int(round(361 - 0.4 * (y - 385))):420] = True
    nonwhite[y, 1500:int(round(1558 + 0.385 * (y - 385))) + 1] = True
nonwhite = cv2.morphologyEx(nonwhite.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
sil = smooth_mask(nonwhite, 1.0)
cnts, _ = cv2.findContours(sil, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
cnts = sorted(cnts, key=cv2.contourArea, reverse=True)[:2]
cnts = sorted(cnts, key=lambda c: cv2.boundingRect(c)[0])  # front (left), back (right)

# 2) darker trim (collar rib, cuffs, hem, sleeve seams)
dark = (g < 135) & (g > 90) & (b > 125) & (b < 185) & (r < 45) & (zone > 0)
dark = cv2.morphologyEx(dark.astype(np.uint8), cv2.MORPH_OPEN, np.ones((2, 2), np.uint8))
dk = smooth_mask(dark, 1.4)
dcnts, _ = cv2.findContours(dk, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)

res = {}
for name, c in zip(['front', 'back'], cnts):
    x, y, w, h = cv2.boundingRect(c)
    box = [x / SCALE, y / SCALE, w / SCALE, h / SCALE]
    inside = [d for d in dcnts
              if x <= cv2.boundingRect(d)[0] <= x + w]
    res[name] = {'bbox': box, 'body': to_path([c]), 'trim': to_path(inside, step=2.2, min_area=8)}

json.dump(res, open('src/shirt-paths.json', 'w'), indent=1)
for k, v in res.items():
    print(k, v['bbox'], len(v['body']), len(v['trim']))
print('neck inner sample', im[250, 610], im[240, 1310])
