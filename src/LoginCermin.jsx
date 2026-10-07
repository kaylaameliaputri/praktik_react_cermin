import { useEffect, useRef, useState } from "react";
import "./LoginCermin.css";

const W = 440;
const H = 580;

const LAMPU = Array.from({ length: 26 }, (_, i) => i);

const GELEMBUNG = Array.from({ length: 5 }, (_, i) => ({
  id: i,
  kiri: 10 + i * 19 + Math.random() * 6,
  ukuran: 18 + Math.random() * 34,
  durasi: 14 + Math.random() * 8,
  tunda: Math.random() * -16,
}));

const JUDUL = {
  login: "Selamat pagi",
  daftar: "Buat akun",
  lupa: "Lupa sandi?",
};

const SUBJUDUL = {
  login: "Masuk untuk memulai rutinitasmu.",
  daftar: "Mulai rutinitas barumu.",
  lupa: "Kami kirim tautan untuk mengatur ulang.",
};

const TOMBOL = {
  login: "Masuk",
  daftar: "Daftar",
  lupa: "Kirim tautan",
};

const POLA_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ucapan = () => {
  const j = new Date().getHours();
  if (j < 4) return "malam";
  if (j < 11) return "pagi";
  if (j < 15) return "siang";
  if (j < 18) return "sore";
  return "malam";
};

const bicara = (teks) => {
  if (!("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(teks);
    u.lang = "id-ID";
    const v = window.speechSynthesis
      .getVoices()
      .find((s) => s.lang.toLowerCase().startsWith("id"));
    if (v) u.voice = v;
    u.rate = 0.95;
    u.pitch = 1.1;
    u.volume = 1;
    window.speechSynthesis.speak(u);
  } catch (err) {
    return;
  }
};

const diamkan = () => {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
};

const buatBusa = () => {
  const meledak = Array.from({ length: 70 }, (_, i) => {
    const sudut = Math.random() * Math.PI * 2;
    const jarak = 200 + Math.random() * 560;
    return {
      id: `m${i}`,
      jenis: "meledak",
      ukuran: 30 + Math.random() * 140,
      dx: Math.cos(sudut) * jarak * 1.3,
      dy: Math.sin(sudut) * jarak,
      dur: 1.6 + Math.random() * 1.4,
      dl: Math.random() * 0.3,
    };
  });
  const naik = Array.from({ length: 34 }, (_, i) => ({
    id: `n${i}`,
    jenis: "naik",
    ukuran: 50 + Math.random() * 160,
    kiri: Math.random() * 100,
    sw: (Math.random() - 0.5) * 140,
    dur: 3.2 + Math.random() * 2.6,
    dl: 0.3 + Math.random() * 1.1,
  }));
  return [...meledak, ...naik];
};

const Mata = ({ buka }) => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
    {!buka && <path d="M4 4l16 16" />}
  </svg>
);

export default function LoginCermin() {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const audioRef = useRef(null);
  const menekan = useRef(false);
  const terakhir = useRef(null);
  const hitung = useRef(0);

  const [bersih, setBersih] = useState(false);
  const [persen, setPersen] = useState(0);
  const [mode, setMode] = useState("login");
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [sandi, setSandi] = useState("");
  const [lihat, setLihat] = useState(false);
  const [galat, setGalat] = useState({});
  const [info, setInfo] = useState("");
  const [panggilan, setPanggilan] = useState("");
  const [suara, setSuara] = useState(true);
  const [sukses, setSukses] = useState(false);
  const [busa, setBusa] = useState([]);
  const [kamera, setKamera] = useState("mati");

  const buatEmbun = () => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    ctx.globalCompositeOperation = "source-over";
    ctx.shadowBlur = 0;
    ctx.clearRect(0, 0, W, H);

    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "rgba(255,232,236,0.97)");
    g.addColorStop(1, "rgba(255,222,226,0.97)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    for (let i = 0; i < 700; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * W, Math.random() * H, 0.5 + Math.random() * 1.2, 0, Math.PI * 2);
      ctx.fillStyle = Math.random() > 0.5 ? "rgba(255,255,255,0.3)" : "rgba(229,112,127,0.09)";
      ctx.fill();
    }

    for (let i = 0; i < 6; i++) {
      const x = 40 + Math.random() * (W - 80);
      const y0 = Math.random() * H * 0.45;
      const pj = 90 + Math.random() * 170;
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,0.28)";
      ctx.lineWidth = 2 + Math.random() * 1.5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(x, y0);
      ctx.quadraticCurveTo(x + (Math.random() - 0.5) * 10, y0 + pj / 2, x + (Math.random() - 0.5) * 6, y0 + pj);
      ctx.stroke();
      ctx.globalCompositeOperation = "source-over";
      const gy = y0 + pj;
      const r = 3.5 + Math.random() * 2.5;
      const rg = ctx.createRadialGradient(x - 1, gy - 2, 0.5, x, gy, r);
      rg.addColorStop(0, "rgba(255,255,255,0.95)");
      rg.addColorStop(1, "rgba(229,150,160,0.3)");
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.ellipse(x, gy, r * 0.85, r * 1.25, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    for (let i = 0; i < 26; i++) {
      const x = Math.random() * W;
      const y = Math.random() * H;
      const r = 1.2 + Math.random() * 2.6;
      const rg = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, 0.3, x, y, r);
      rg.addColorStop(0, "rgba(255,255,255,0.95)");
      rg.addColorStop(1, "rgba(229,150,160,0.28)");
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(196,70,95,0.6)";
    ctx.font = "italic 400 34px 'Cormorant Garamond', Georgia, serif";
    ctx.fillText("usap perlahan", W / 2, H / 2 + 8);
    ctx.fillStyle = "rgba(196,70,95,0.4)";
    ctx.fillRect(W / 2 - 18, H / 2 + 28, 36, 1);
  };

  useEffect(() => {
    buatEmbun();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (!bersih && persen === 0) buatEmbun();
      });
    }
    return () => {
      stopKamera();
      diamkan();
      if (audioRef.current) audioRef.current.close().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (kamera === "nyala" && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [kamera, sukses]);

  const stopKamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const nyalakanKamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      setKamera("nyala");
    } catch (err) {
      setKamera("ditolak");
    }
  };

  const mainkanLampu = () => {
    if (!suara) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!audioRef.current) audioRef.current = new AC();
      const ac = audioRef.current;
      if (ac.state === "suspended") ac.resume();
      const t0 = ac.currentTime + 0.05;
      LAMPU.forEach((i) => {
        const t = t0 + i * 0.055;
        const o = ac.createOscillator();
        const g = ac.createGain();
        o.type = "sine";
        o.frequency.setValueAtTime(880 + i * 28, t);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.18, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
        o.connect(g);
        g.connect(ac.destination);
        o.start(t);
        o.stop(t + 0.2);
      });
    } catch (err) {
      return;
    }
  };

  const cekBersih = () => {
    const ctx = canvasRef.current.getContext("2d");
    const data = ctx.getImageData(0, 0, W, H).data;
    let total = 0;
    let kosong = 0;
    for (let y = 0; y < H; y += 12) {
      for (let x = 0; x < W; x += 12) {
        total++;
        if (data[(y * W + x) * 4 + 3] < 40) kosong++;
      }
    }
    const p = Math.round((kosong / total) * 100);
    setPersen(p);
    if (p >= 55 && !bersih) {
      setBersih(true);
      mainkanLampu();
    }
  };

  const posisi = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * W,
      y: ((e.clientY - r.top) / r.height) * H,
    };
  };

  const lap = (e) => {
    if (!menekan.current || bersih) return;
    const ctx = canvasRef.current.getContext("2d");
    const p = posisi(e);
    const a = terakhir.current || p;
    ctx.globalCompositeOperation = "destination-out";
    ctx.strokeStyle = "#000";
    ctx.shadowColor = "#000";
    ctx.shadowBlur = 16;
    ctx.lineWidth = 52;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    terakhir.current = p;
    hitung.current++;
    if (hitung.current % 10 === 0) cekBersih();
  };

  const mulai = (e) => {
    menekan.current = true;
    terakhir.current = null;
    canvasRef.current.setPointerCapture(e.pointerId);
    lap(e);
  };

  const selesai = () => {
    menekan.current = false;
    terakhir.current = null;
    cekBersih();
  };

  const lapSemua = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.globalCompositeOperation = "source-over";
    ctx.shadowBlur = 0;
    ctx.clearRect(0, 0, W, H);
    setPersen(100);
    setBersih(true);
    mainkanLampu();
  };

  const gantiMode = (m) => {
    setMode(m);
    setGalat({});
    setInfo("");
    setSandi("");
    setLihat(false);
  };

  const embunLagi = () => {
    diamkan();
    stopKamera();
    setKamera("mati");
    buatEmbun();
    setBersih(false);
    setPersen(0);
    setGalat({});
    setInfo("");
    setSukses(false);
    setBusa([]);
    setSandi("");
    setLihat(false);
    hitung.current = 0;
  };

  const ubah = (kunci, setter) => (e) => {
    setter(e.target.value);
    if (galat[kunci]) setGalat((g) => ({ ...g, [kunci]: "" }));
    if (info) setInfo("");
  };

  const kirim = (e) => {
    e.preventDefault();
    if (!bersih) return;
    const em = email.trim();
    const g = {};
    if (mode === "daftar" && !nama.trim()) g.nama = "Nama belum diisi";
    if (!em) g.email = "Email belum diisi";
    else if (!POLA_EMAIL.test(em)) g.email = "Format email belum valid";
    if (mode !== "lupa") {
      if (!sandi) g.sandi = "Kata sandi belum diisi";
      else if (sandi.length < 6) g.sandi = "Minimal 6 karakter";
    }
    setGalat(g);
    setInfo("");
    if (Object.keys(g).length) return;
    if (mode === "lupa") {
      setInfo(`Tautan reset sudah dikirim ke ${em}`);
      return;
    }
    const nm = mode === "daftar" ? nama.trim() : em.split("@")[0];
    setPanggilan(nm);
    setBusa(buatBusa());
    setSukses(true);
    nyalakanKamera();
    if (suara) bicara(`Halo ${nm}, selamat ${ucapan()}`);
  };

  const keluar = () => {
    diamkan();
    stopKamera();
    setKamera("mati");
    setSukses(false);
    setBusa([]);
    setSandi("");
    setNama("");
    setLihat(false);
    setMode("login");
    setGalat({});
    setInfo("");
  };

  return (
    <div className="ruang">
      <div className="glow" aria-hidden="true" />

      <div className="latar" aria-hidden="true">
        {GELEMBUNG.map((b) => (
          <span
            key={b.id}
            className="gelembung"
            style={{
              left: `${b.kiri}%`,
              width: b.ukuran,
              height: b.ukuran,
              animationDuration: `${b.durasi}s`,
              animationDelay: `${b.tunda}s`,
            }}
          />
        ))}
      </div>

      <main className={`bingkai ${sukses ? "berkilau" : ""} ${bersih ? "terang" : ""}`}>
        <div className={`lampu ${bersih ? "nyala" : ""}`} aria-hidden="true">
          {LAMPU.map((i) => (
            <span
              key={i}
              style={{
                offsetDistance: `${(i / LAMPU.length) * 100}%`,
                "--d": `${i * 55}ms`,
              }}
            />
          ))}
        </div>

        <div className="kaca">
          {!sukses ? (
            <form className={`isi ${mode}`} onSubmit={kirim} noValidate>
              <h1>{mode === "login" ? `Selamat ${ucapan()}` : JUDUL[mode]}</h1>
              <p className="sub">{SUBJUDUL[mode]}</p>

              {mode === "daftar" && (
                <>
                  <label htmlFor="nama">Nama panggilan</label>
                  <input
                    id="nama"
                    type="text"
                    value={nama}
                    placeholder="nama kamu"
                    onChange={ubah("nama", setNama)}
                    disabled={!bersih}
                    autoComplete="nickname"
                    aria-invalid={!!galat.nama}
                  />
                  {galat.nama && <p className="galat" role="alert">{galat.nama}</p>}
                </>
              )}

              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                placeholder="nama@email.com"
                onChange={ubah("email", setEmail)}
                disabled={!bersih}
                autoComplete="email"
                aria-invalid={!!galat.email}
              />
              {galat.email && <p className="galat" role="alert">{galat.email}</p>}

              {mode !== "lupa" && (
                <>
                  <label htmlFor="sandi">Kata sandi</label>
                  <div className="kolom">
                    <input
                      id="sandi"
                      className="sandi"
                      type={lihat ? "text" : "password"}
                      value={sandi}
                      placeholder="minimal 6 karakter"
                      onChange={ubah("sandi", setSandi)}
                      disabled={!bersih}
                      autoComplete={mode === "daftar" ? "new-password" : "current-password"}
                      aria-invalid={!!galat.sandi}
                    />
                    <button
                      type="button"
                      className="mata"
                      onClick={() => setLihat((v) => !v)}
                      disabled={!bersih}
                      aria-label={lihat ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                    >
                      <Mata buka={lihat} />
                    </button>
                  </div>
                  {galat.sandi && <p className="galat" role="alert">{galat.sandi}</p>}
                </>
              )}

              {mode === "login" && (
                <div className="baris">
                  <button
                    type="button"
                    className="mini"
                    onClick={() => gantiMode("lupa")}
                    disabled={!bersih}
                  >
                    Lupa kata sandi?
                  </button>
                </div>
              )}

              <button className="masuk" type="submit" disabled={!bersih}>
                {TOMBOL[mode]}
              </button>
              {info && <p className="pesan" role="status">{info}</p>}

              <p className="alih">
                {mode === "login" && (
                  <>
                    Belum punya akun?{" "}
                    <button type="button" className="mini tebal" onClick={() => gantiMode("daftar")} disabled={!bersih}>
                      Daftar
                    </button>
                  </>
                )}
                {mode === "daftar" && (
                  <>
                    Sudah punya akun?{" "}
                    <button type="button" className="mini tebal" onClick={() => gantiMode("login")} disabled={!bersih}>
                      Masuk
                    </button>
                  </>
                )}
                {mode === "lupa" && (
                  <button type="button" className="mini tebal" onClick={() => gantiMode("login")} disabled={!bersih}>
                    Kembali ke masuk
                  </button>
                )}
              </p>
            </form>
          ) : (
            <div className="selfie">
              {kamera === "nyala" ? (
                <video ref={videoRef} className="video" playsInline muted autoPlay />
              ) : (
                <div className="tanpa-kamera">
                  <span className="cincin" />
                  <p>
                    {kamera === "ditolak"
                      ? "Kamera tidak diizinkan. Kamu tetap bisa lanjut."
                      : "Menyalakan kamera…"}
                  </p>
                </div>
              )}
              <div className="sapa">
                <h1>Halo, {panggilan}</h1>
                <p>Pantulan terbaikmu, hari ini !</p>
                <button className="masuk terang" onClick={keluar}>Keluar</button>
              </div>
            </div>
          )}

          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className={`embun ${bersih ? "hilang" : ""}`}
            onPointerDown={mulai}
            onPointerMove={lap}
            onPointerUp={selesai}
            onPointerCancel={selesai}
            aria-label="Cermin berembun, usap untuk membersihkan"
          />

          {!bersih && (
            <div className="progres" aria-hidden="true">
              <span style={{ width: `${Math.min(100, Math.round((persen / 55) * 100))}%` }} />
            </div>
          )}
          <div className="kilat" />
        </div>
      </main>

      <div className="tombol">
        {!bersih && (
          <button className="tautan" onClick={lapSemua}>
            Bersihkan sekarang
          </button>
        )}
        {bersih && (
          <button className="tautan" onClick={embunLagi}>
            Embunkan lagi
          </button>
        )}
        <button className="tautan" onClick={() => setSuara((s) => !s)}>
          {suara ? "Suara nyala" : "Suara mati"}
        </button>
      </div>

      <div className="busa-layer" aria-hidden="true">
        {busa.map((b) =>
          b.jenis === "meledak" ? (
            <span
              key={b.id}
              className="gel meledak"
              style={{
                width: b.ukuran,
                height: b.ukuran,
                "--dx": `${b.dx}px`,
                "--dy": `${b.dy}px`,
                animationDuration: `${b.dur}s`,
                animationDelay: `${b.dl}s`,
              }}
            />
          ) : (
            <span
              key={b.id}
              className="gel naik"
              style={{
                width: b.ukuran,
                height: b.ukuran,
                left: `${b.kiri}%`,
                "--sw": `${b.sw}px`,
                animationDuration: `${b.dur}s`,
                animationDelay: `${b.dl}s`,
              }}
            />
          )
        )}
      </div>
    </div>
  );
}