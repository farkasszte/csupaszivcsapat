# Csupaszív kalandok: A Homokhátság Hősei

Ez a projekt egy modern, webalapú interaktív történetmesélő játék, amely a magyarországi Homokhátság tájegységére építve nyújt oktatási és szórakoztató élményt. A játékosok döntéseiken keresztül alakíthatják a történetet, miközben megismerhetik a régió természeti és kulturális értékeit.

## 🛠 Műszaki áttekintés

A projekt a legmodernebb webes technológiák felhasználásával készült, fókuszban a sebességgel, az interaktivitással és a reszponzív dizájnnal.

### Technológiai stack
- **Keretrendszer:** [Next.js 16](https://nextjs.org/) (App Router architektúra) és [React 19](https://react.dev/).
- **Stílus és Megjelenés:** [Tailwind CSS 4](https://tailwindcss.com/) a dinamikus és modern látványvilágért (glassmorphism effektek, animációk).
- **Állapotkezelés:** [Zustand](https://zustand-demo.pmnd.rs/) és React Context API a játékmenet és a felhasználói állapot szinkronizálásához.
- **Adatbázis és Hitelesítés:** [Supabase](https://supabase.com/) (PostgreSQL, Auth, SSR támogatás).
- **Térképkezelés:** [Leaflet](https://leafletjs.com/) és `react-leaflet` az interaktív régiós térkép megjelenítéséhez.
- **Dokumentumkezelés:** `docx`, `jspdf` és `html2pdf.js` a játékbeli eredmények és riportok generálásához.
- **Ikonkészlet:** Remix Icon és React Icons.

### Főbb technikai funkciók
- **Story Engine:** Egy egyedi fejlesztésű motor, amely kezeli a párbeszédeket, az elágazó történetvezetést és a médiaelemek (képek, videók) szinkronizált megjelenítését.
- **Reszponzív dizájn:** Asztali és mobil eszközökön egyaránt optimalizált felület, speciális „oldalpanel” rendszerrel a kiegészítő információkhoz (térkép, napló, profil).
- **Akadálymentesítés:** Beépített színszűrők (protanópia, deuteranópia, tritanópia) a látássérült felhasználók támogatása érdekében.
- **Dinamikus eszköztár:** Valós idejű jutalomrendszer és inventory kezelés.
- **Interaktív Tudástár:** Dinamikusan frissülő oktatási modul, amely a történet előrehaladtával nyílik meg.

## 📖 Tartalmi bemutatás

A **Csupaszív kalandok: A Homokhátság Hősei** egy narratív alapú kalandjáték, amelynek célja a Kiskunság és a Homokhátság értékeinek játékos formában történő átadása.

### A történet világa
A játékos egy kalandor bőrébe bújik, aki a Homokhátság különleges tájait járja be. A történet során különböző karakterekkel találkozik, rejtélyeket old meg, és olyan döntéseket hoz, amelyek befolyásolják a küldetés sikerét és a karakter fejlődését.

### Főbb modulok
1.  **Történetválasztás:** A játék indulásakor különböző történeti szálak közül választhatunk, amelyek más-más aspektusát mutatják be a régiónak.
2.  **Napló (History):** Visszakövethető az eddigi események és döntések sora.
3.  **Jutalmak és Eredmények:** A játékos pontokat, jelvényeket és virtuális tárgyakat gyűjthet a sikeres küldetésekért.
4.  **Régiós Térkép:** Megmutatja a játékos aktuális pozícióját és a fontosabb helyszíneket a Homokhátság területén.
5.  **Tudástár (Library):** Részletes háttérinformációk a régió védett növényeiről, állatairól és néprajzi sajátosságairól.
6.  **Profil:** A játékos egyéni statisztikái és mentései.

---
*Készült a Csupaszív Csapat fejlesztésében.*
