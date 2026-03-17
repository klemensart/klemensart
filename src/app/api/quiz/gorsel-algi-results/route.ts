import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { sendThankYouEmail } from "@/lib/send-thank-you";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, resultType } = body as {
    email: string;
    resultType: string;
  };

  if (!email || !resultType) {
    return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });
  }

  const trimmedEmail = email.trim().toLowerCase();
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(trimmedEmail)) {
    return NextResponse.json(
      { error: "Geçerli bir e-posta adresi girin." },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  // Check if email is already registered in auth.users
  let registeredUserId: string | null = null;
  let page = 1;
  while (true) {
    const {
      data: { users },
      error,
    } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error || !users || users.length === 0) break;
    const found = users.find((u) => u.email?.toLowerCase() === trimmedEmail);
    if (found) {
      registeredUserId = found.id;
      break;
    }
    if (users.length < 1000) break;
    page++;
  }

  if (registeredUserId) {
    return NextResponse.json({ registered: true });
  }

  // Subscribe to newsletter
  const { data: existing } = await admin
    .from("subscribers")
    .select("id, is_active")
    .eq("email", trimmedEmail)
    .maybeSingle();

  if (existing) {
    if (!existing.is_active) {
      await admin
        .from("subscribers")
        .update({ is_active: true })
        .eq("id", existing.id);
    }
  } else {
    await admin
      .from("subscribers")
      .insert({ email: trimmedEmail, source: "gorsel-algi-testi" });
  }

  // Build and send the results email
  const html = buildResultsEmail(resultType);

  await sendThankYouEmail({
    to: trimmedEmail,
    subject: `Görsel Algı Testi — Sanat Kişilik Analiziniz Hazır`,
    html,
  });

  return NextResponse.json({ sent: true });
}

const TYPES: Record<
  string,
  {
    label: string;
    tagline: string;
    subtitle: string;
    soulArt: string;
    soulWhy: string;
    analysis: string;
    channel: string;
    channelDesc: string;
    heel: string;
    heelDesc: string;
    power: string;
    powerDesc: string;
    museum: string;
    museumDesc: string;
    recipe: string;
    palette: string[];
    paletteNames: string[];
    era: string;
    eraDesc: string;
  }
> = {
  analitik: {
    label: "ANALİTİK ESTET",
    tagline:
      "Uyum tesadüf değil, zihnin en zarif mimarisidir.",
    subtitle: "Zihinsel Mimar",
    palette: ["#F5F0EB", "#1A3A5C", "#C9A84C"],
    paletteNames: ["Mermer Beyazı", "Lapis Lazuli", "Altın Sarısı"],
    era: "1500'ler Floransa'sı",
    eraDesc:
      "Rönesans'ın kalbi. Aklın, bilimin ve sanatın kusursuz birleşimi.",
    soulArt: "Atina Okulu — Raphael",
    soulWhy:
      "Bu fresk, aklın ve dengenin resmedilmiş halidir. Merkezdeki kusursuz perspektif, hayatı algılama biçimini yansıtır.",
    channel: "Görsel ve Yapısal",
    channelDesc:
      "Gördüğün kanıta inanırsın. Zihnin her detayı kusursuz bir kompozisyonun parçası olarak sınıflandırır.",
    analysis:
      "Sen zihinsel bir mimarsın. Belirsizliğe, dağınıklığa tahammülün yok. Bir tabloya baktığında renklerin arkasındaki geometriyi, dengeyi ve aklı görürsün.",
    heel: "Mükemmeliyetçilik Felci",
    heelDesc:
      '"En iyisi olmayacaksa hiç olmasın" diyerek potansiyelini erteliyorsun.',
    power: "Kaosu Yapılandırmak",
    powerDesc:
      "Başkalarının kriz anında eli ayağına dolaşırken, sen soğukkanlılıkla parçaları birleştirir ve çözüm planını masaya koyarsın.",
    museum: "Stratejist",
    museumDesc:
      "Müzeye girmeden haritayı incelersin. Bilgi kartını okumadan esere bakmak seni tatmin etmez.",
    recipe:
      "Zihnin dolduğunda Piet Mondrian'ın minimalist eserlerine bak. O net çizgiler seni resetleyecektir.",
  },
  tutkulu: {
    label: "TUTKULU ESTET",
    tagline:
      "Duyguların ateşiyle yanmayan bir fırça, sadece tuvali kirletir.",
    subtitle: "Filtresiz Gerçeklik Aşığı",
    palette: ["#1A1A1A", "#8B1A1A", "#6B4226"],
    paletteNames: ["Zifiri Siyah", "Kan Kırmızısı", "Toprak Oksidi"],
    era: "1600'ler Roma'sı",
    eraDesc:
      "Tehlikeli sokaklar, tutkulu aşklar, ihtişam ve dehanın birbirine karıştığı fırtınalı Barok çağı.",
    soulArt: "Davut ve Golyat'ın Başı — Caravaggio",
    soulWhy:
      "Bu eser, kendi içindeki karanlıkla yüzleşme cesaretini simgeler.",
    channel: "Dokunsal ve Hissel",
    channelDesc:
      "Sadece bakarak ikna olmazsın, hissetmek istersin. Tüylerini ürpertmeyen şey senin için yok hükmündedir.",
    analysis:
      "Sen hayatı uçlarda yaşayan birisin; gri alanlar sana göre değil. Sahte nezaketlerden sıkılırsın.",
    heel: "Duygusal Tükeniş",
    heelDesc:
      "Ya hep ya hiç mantığıyla yaşadığın için kendi ateşinde yanabilirsin.",
    power: "Yüzleşme Cesareti",
    powerDesc:
      "Herkesin halı altına süpürdüğü gerçeği sen işaret edersin.",
    museum: "Avcı",
    museumDesc:
      "İçeri girer, kalbinden vuran o tek eseri bulur ve bir saat onun önünde durursun.",
    recipe:
      "Fırtınanı dindirmek için Vermeer'in sessiz 'Süt Döken Kadın' tablosunu hatırla.",
  },
  melankolik: {
    label: "MELANKOLİK ESTET",
    tagline:
      "Kalabalıkların alkışındansa, yüce bir yalnızlığın fısıltısını tercih ederim.",
    subtitle: "İçe Dönük Gözlemci",
    palette: ["#B0B8BF", "#1C3D5A", "#D4CFC8"],
    paletteNames: ["Sis Grisi", "Prusya Mavisi", "Soluk Ay Işığı"],
    era: "1800'ler Almanya'sı",
    eraDesc:
      "Romantizm'in, felsefenin ve şiirin sokaklara taştığı, doğaya sığınılan dönem.",
    soulArt: "Bulutların Üzerinde Yolculuk — C.D. Friedrich",
    soulWhy:
      "Zirvede, tek başına, sonsuz sis denizini izleyen o figür sensin.",
    channel: "İşitsel ve İçsel",
    channelDesc:
      "Dış dünyanın sesini kısıp iç sesini dinlersin. Estetik algın sessizlikte ve boşluklarda gizlidir.",
    analysis:
      "Sen kalabalıklarda bile kendi adasında yaşayan birisin. Dünyanın yüzeysel gürültüsü seni çok yorar.",
    heel: "İzolasyon ve Eylemsizlik",
    heelDesc:
      "Zihninde o kadar güvenli bir kale kurdun ki, dışarı çıkıp hayatın risklerine karışmaktan korkuyorsun.",
    power: "Derin İçgörü",
    powerDesc:
      "Başkalarının bakıp geçtiği detaylarda bütün bir evreni görürsün. Sessizliğin boşluk değil, bilgeliktir.",
    museum: "Yalnız Gezgin",
    museumDesc:
      "Kulaklığını takarsın, kalabalık gruplardan kaçarsın. Eserle baş başa sessiz bir diyalog kurarsın.",
    recipe:
      "Sis denizinde kaybolduğunda Pieter Bruegel'in hareketli köy tablolarına bak.",
  },
  sezgisel: {
    label: "SEZGİSEL ESTET",
    tagline:
      "Gerçek sabit değildir; ışığın açısına göre her an yeni bir renge bürünür.",
    subtitle: "İzlenimci Ruh",
    palette: ["#F2C4CE", "#A8D5BA", "#C8B2D6"],
    paletteNames: ["Pastel Pembe", "Su Yeşili", "Lila"],
    era: "1870'ler Paris'i",
    eraDesc:
      "Geniş bulvarlar, nehir kenarı piknikleri, kafeler ve yaşama sevinci.",
    soulArt: "İzlenim: Gün Doğumu — Claude Monet",
    soulWhy:
      "Net çizgiler, keskin sınırlar ve katı kurallar yoktur. Sadece anın uçucu hissi ve sabahın umudu vardır.",
    channel: "Duyusal ve Sezgisel",
    channelDesc:
      "Kokular, tatlar, atmosfer senin hafızanı oluşturur. Olayları ilk izlenimle kavrarsın.",
    analysis:
      "Sen anda yaşayan bir ruhsun. Katı planlar sana göre değil. Monet'nin nilüferleri gibi akışkan ve değişkensin.",
    heel: "Odaklanma Sorunu",
    heelDesc:
      "Zorluklarla yüzleşmek yerine gerçeği flulaştırma eğilimin var. Çabuk sıkılma en büyük tuzağın.",
    power: "Akışta Kalmak",
    powerDesc:
      "Değişime en hızlı ayak uyduran sensin. Planlar bozulduğunda yeni rotanın tadını çıkarırsın.",
    museum: "Plansız Gezgin (Flaneur)",
    museumDesc:
      "Gözüne hangi renk güzel geliyorsa o yöne saparsın. Eserin verdiği ilk hissi alıp yoluna devam edersin.",
    recipe:
      "Sürekli yüzeyde yüzmek seni yoracak. Rembrandt'ın karanlık otoportrelerine bak.",
  },
  isyankar: {
    label: "İSYANKAR ESTET",
    tagline:
      "Uyum ve düzen sadece korkakların sığınağıdır; asıl cesaret kendi kaosunu kucaklamaktır.",
    subtitle: "Kural Yıkıcı Ruh",
    palette: ["#003DA5", "#CC5500", "#F4C430"],
    paletteNames: ["Kobalt Mavisi", "Yanık Turuncu", "Ayçiçeği Sarısı"],
    era: "1900'lerin Başı",
    eraDesc:
      "Kuralların yıkıldığı, bireyselliğin en yüksek sesle haykırıldığı Ekspresyonizm dönemi.",
    soulArt: "Yıldızlı Gece — Vincent van Gogh",
    soulWhy:
      "O tabloda gökyüzü bile yerinde duramıyor. İçsel enerjin ve fırtınaların da tıpkı o yıldızlar gibi hem parlak hem yakıcı.",
    channel: "Kinestetik ve Ritmik",
    channelDesc:
      "Yerinde duramazsın. Dünyayı fiziksel enerji ve ritim üzerinden algılarsın.",
    analysis:
      "Sen bir statüko düşmanısın. Var olan düzen, kalıplar ve 'normal' denen her şey seni boğar.",
    heel: "Dürtüsellik ve Yıkıcılık",
    heelDesc:
      "Enerjini kontrol edemediğinde kendini de yakabilirsin. Sabırsızlık en büyük düşmanın.",
    power: "Yaratıcı Dönüşüm (Katharsis)",
    powerDesc:
      "Yoğun ve karanlık duygulardan muazzam güç yaratma yeteneğin var.",
    museum: "Dürtüsel ve Seçici",
    museumDesc:
      "Enerji vermeyen eserin önünde bir saniye bile durmazsın.",
    recipe:
      "Volkanik enerjin köklerini yakıyor. Cézanne'ın dingin elma natürmortlarına bak.",
  },
};

function buildResultsEmail(resultType: string): string {
  const r = TYPES[resultType];
  if (!r) return "<p>Sonuç bulunamadı.</p>";

  return `
<!DOCTYPE html>
<html lang="tr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f3f0;font-family:'Segoe UI','Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;">

    <!-- Header -->
    <div style="text-align:center;padding:48px 40px 0;">
      <img src="https://sgabkrzzzszfqrtgkord.supabase.co/storage/v1/object/public/email-assets/logo-yazi-somon.PNG" alt="Klemens Art" width="160" style="display:block;margin:0 auto;" />
    </div>
    <hr style="border:none;border-top:1px solid #e8e4df;margin:28px auto;width:86%;" />

    <div style="padding:0 48px;">
      <div style="text-align:center;margin-bottom:28px;">
        <div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#FF6D60;margin-bottom:8px;">
          Görsel Algı & Karakter Analizi
        </div>
        <h1 style="font-size:26px;font-weight:800;color:#2D2926;margin:0 0 8px;line-height:1.3;">
          ${r.label}
        </h1>
        <p style="font-size:14px;color:#FF6D60;margin:0 0 4px;font-weight:600;">${r.subtitle}</p>
        <p style="font-size:16px;font-style:italic;color:#5C524D;margin:8px 0 0;line-height:1.6;">
          "${r.tagline}"
        </p>
      </div>

      <!-- Palette -->
      <div style="text-align:center;margin-bottom:28px;">
        ${r.palette.map((c, i) => `<span style="display:inline-block;width:40px;height:40px;border-radius:50%;background:${c};border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.1);margin:0 4px;"></span>`).join("")}
        <div style="margin-top:8px;font-size:12px;color:#9B918A;">${r.paletteNames.join(" · ")}</div>
      </div>

      <!-- Analysis -->
      <div style="background:#FFFBF7;border-radius:12px;padding:24px;margin-bottom:20px;border-left:3px solid #FF6D60;">
        <div style="font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#FF6D60;margin-bottom:12px;">Karakter Analizi</div>
        <p style="font-size:15px;line-height:1.8;color:#3d3833;margin:0;">${r.analysis}</p>
      </div>

      <!-- Soul Art -->
      <div style="background:#FFFBF7;border-radius:12px;padding:24px;margin-bottom:20px;border-left:3px solid ${r.palette[1]};">
        <div style="font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${r.palette[1]};margin-bottom:12px;">Ruh Eşi Eserin</div>
        <p style="font-size:17px;font-weight:700;color:#2D2926;margin:0 0 8px;">${r.soulArt}</p>
        <p style="font-size:14px;line-height:1.7;color:#5C524D;margin:0;">${r.soulWhy}</p>
      </div>

      <!-- Channel -->
      <div style="background:#FFFBF7;border-radius:12px;padding:24px;margin-bottom:20px;">
        <div style="font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#9B918A;margin-bottom:12px;">Algı Kanalın: ${r.channel}</div>
        <p style="font-size:14px;line-height:1.7;color:#5C524D;margin:0;">${r.channelDesc}</p>
      </div>

      <!-- Power & Heel -->
      <table style="width:100%;border-collapse:separate;border-spacing:12px 0;margin-bottom:20px;">
        <tr>
          <td style="width:50%;vertical-align:top;background:#FFFBF7;border-radius:12px;padding:20px;">
            <div style="font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#FF6D60;margin-bottom:8px;">Aşil Topuğun</div>
            <div style="font-size:14px;font-weight:700;color:#2D2926;margin-bottom:6px;">${r.heel}</div>
            <div style="font-size:13px;line-height:1.6;color:#5C524D;">${r.heelDesc}</div>
          </td>
          <td style="width:50%;vertical-align:top;background:#FFFBF7;border-radius:12px;padding:20px;">
            <div style="font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#22c55e;margin-bottom:8px;">Süper Gücün</div>
            <div style="font-size:14px;font-weight:700;color:#2D2926;margin-bottom:6px;">${r.power}</div>
            <div style="font-size:13px;line-height:1.6;color:#5C524D;">${r.powerDesc}</div>
          </td>
        </tr>
      </table>

      <!-- Era & Museum -->
      <table style="width:100%;border-collapse:separate;border-spacing:12px 0;margin-bottom:20px;">
        <tr>
          <td style="width:50%;vertical-align:top;background:#FFFBF7;border-radius:12px;padding:20px;">
            <div style="font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#9B918A;margin-bottom:8px;">Ait Olduğun Dönem</div>
            <div style="font-size:14px;font-weight:700;color:#2D2926;margin-bottom:6px;">${r.era}</div>
            <div style="font-size:13px;line-height:1.6;color:#5C524D;">${r.eraDesc}</div>
          </td>
          <td style="width:50%;vertical-align:top;background:#FFFBF7;border-radius:12px;padding:20px;">
            <div style="font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#9B918A;margin-bottom:8px;">Müze Gezme Tarzın</div>
            <div style="font-size:14px;font-weight:700;color:#2D2926;margin-bottom:6px;">${r.museum}</div>
            <div style="font-size:13px;line-height:1.6;color:#5C524D;">${r.museumDesc}</div>
          </td>
        </tr>
      </table>

      <!-- Recipe -->
      <div style="background:linear-gradient(135deg,rgba(255,109,96,0.06),rgba(255,109,96,0.02));border-radius:12px;padding:24px;margin-bottom:28px;border:1px solid rgba(255,109,96,0.15);">
        <div style="font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#FF6D60;margin-bottom:12px;">Klemens'in Reçetesi</div>
        <p style="font-size:15px;line-height:1.75;color:#5C524D;margin:0;font-style:italic;">${r.recipe}</p>
      </div>

      <!-- CTA -->
      <div style="text-align:center;margin-bottom:28px;">
        <a href="https://klemensart.com/testler/gorsel-algi" style="display:inline-block;background:#FF6D60;color:#ffffff;font-size:14px;font-weight:600;letter-spacing:1px;text-transform:uppercase;text-decoration:none;padding:16px 40px;text-align:center;">
          Testi Tekrar Çöz
        </a>
      </div>

      <p style="font-size:14px;line-height:1.8;color:#3d3833;margin:0 0 0 0;">
        Sevgiyle,<br />
        <strong style="color:#2D2926;">Klemens Art Ekibi</strong>
      </p>
    </div>

    <!-- Footer -->
    <hr style="border:none;border-top:1px solid #e8e4df;margin:28px auto;width:86%;" />
    <div style="text-align:center;padding:0 48px 40px;">
      <div style="font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#1A1A1A;margin:0;">Klemens Art</div>
      <div style="font-size:11px;color:#999;margin:4px 0 20px;">Ankara, Türkiye</div>
      <div style="font-size:11px;color:#b0a99f;line-height:1.6;">
        Bu e-postayı Görsel Algı Testi sonuçlarınız için aldınız.<br/>
        <a href="https://klemensart.com/abonelik-iptal" style="color:#999;text-decoration:underline;">Abonelikten çıkmak için tıklayın</a>
      </div>
    </div>

  </div>
</body>
</html>`;
}
