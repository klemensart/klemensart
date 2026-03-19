"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase";

const BRAND = {
  coral: "#FF6D60", coralLight: "#FF6D6015", coralMid: "#FF6D6030",
  cream: "#FFFBF7", dark: "#2D2926", warm: "#5C524D", muted: "#9B918A", border: "#E8E0D8",
};

const IMAGES: Record<string, { src: string; alt: string }> = {
  analitik: { src: "/images/testler/ronesans/atina-okulu.webp", alt: "Atina Okulu — Raphael" },
  tutkulu: { src: "/images/testler/gorsel-algi/davut-golyat.webp", alt: "Davut ve Golyat — Caravaggio" },
  melankolik: { src: "/images/testler/gorsel-algi/bulutlar-uzerinde.webp", alt: "Bulutların Üzerinde Yolculuk — C.D. Friedrich" },
  sezgisel: { src: "/images/testler/gorsel-algi/izlenim-gun-dogumu.webp", alt: "İzlenim: Gün Doğumu — Claude Monet" },
  isyankar: { src: "/images/testler/gorsel-algi/yildizli-gece.webp", alt: "Yıldızlı Gece — Vincent van Gogh" },
};

const TYPES: Record<string, {
  key: string; label: string; tagline: string; subtitle: string;
  palette: string[]; paletteNames: string[]; era: string; eraDesc: string;
  soulArt: string; soulWhy: string; channel: string; channelDesc: string;
  analysis: string; heel: string; heelDesc: string; power: string; powerDesc: string;
  museum: string; museumDesc: string; recipe: string;
}> = {
  analitik: { key:"analitik", label:"ANALİTİK ESTET", tagline:"Uyum tesadüf değil, zihnin en zarif mimarisidir.", subtitle:"Zihinsel Mimar", palette:["#F5F0EB","#1A3A5C","#C9A84C"], paletteNames:["Mermer Beyazı","Lapis Lazuli","Altın Sarısı"], era:"1500'ler Floransa'sı", eraDesc:"Rönesans'ın kalbi. Aklın, bilimin ve sanatın kusursuz birleşimi.", soulArt:"Atina Okulu — Raphael", soulWhy:"Bu fresk, aklın ve dengenin resmedilmiş halidir. Merkezdeki kusursuz perspektif, hayatı algılama biçimini yansıtır.", channel:"Görsel ve Yapısal", channelDesc:"Gördüğün kanıta inanırsın. Zihnin her detayı kusursuz bir kompozisyonun parçası olarak sınıflandırır.", analysis:"Sen zihinsel bir mimarsın. Belirsizliğe, dağınıklığa tahammülün yok. Bir tabloya baktığında renklerin arkasındaki geometriyi, dengeyi ve aklı görürsün. Anlamak, senin için hissetmekten daha güvenlidir.", heel:"Mükemmeliyetçilik Felci", heelDesc:"\"En iyisi olmayacaksa hiç olmasın\" diyerek potansiyelini erteliyorsun. Düşünmekten eyleme geçemiyorsun.", power:"Kaosu Yapılandırmak", powerDesc:"Başkalarının kriz anında eli ayağına dolaşırken, sen soğukkanlılıkla parçaları birleştirir ve çözüm planını masaya koyarsın.", museum:"Stratejist", museumDesc:"Müzeye girmeden haritayı incelersin. Bilgi kartını okumadan esere bakmak seni tatmin etmez.", recipe:"Zihnin dolduğunda Piet Mondrian'ın minimalist eserlerine bak. O net çizgiler seni resetleyecektir. Ama ruhunu iyileştirmek için biraz \"kirlenmen\" lazım." },
  tutkulu: { key:"tutkulu", label:"TUTKULU ESTET", tagline:"Duyguların ateşiyle yanmayan bir fırça, sadece tuvali kirletir.", subtitle:"Filtresiz Gerçeklik Aşığı", palette:["#1A1A1A","#8B1A1A","#6B4226"], paletteNames:["Zifiri Siyah","Kan Kırmızısı","Toprak Oksidi"], era:"1600'ler Roma'sı", eraDesc:"Tehlikeli sokaklar, tutkulu aşklar, ihtişam ve dehanın birbirine karıştığı fırtınalı Barok çağı.", soulArt:"Davut ve Golyat'ın Başı — Caravaggio", soulWhy:"Bu eser, kendi içindeki karanlıkla yüzleşme cesaretini simgeler. Sen de gerçeği çekinmeden masaya koyan o cesur ruhu taşıyorsun.", channel:"Dokunsal ve Hissel", channelDesc:"Sadece bakarak ikna olmazsın, hissetmek istersin. Tüylerini ürpertmeyen şey senin için yok hükmündedir.", analysis:"Sen hayatı uçlarda yaşayan birisin; gri alanlar sana göre değil. Sahte nezaketlerden sıkılırsın. Önemli olan şeyin güzel görünmesi değil, gerçek olmasıdır.", heel:"Duygusal Tükeniş", heelDesc:"Ya hep ya hiç mantığıyla yaşadığın için kendi ateşinde yanabilirsin. Dinlenmeyi bilmiyorsun.", power:"Yüzleşme Cesareti", powerDesc:"Herkesin halı altına süpürdüğü gerçeği sen işaret edersin. Krizle karşılaştığında kaçmaz, gözünün içine bakarsın.", museum:"Avcı", museumDesc:"İçeri girer, kalbinden vuran o tek eseri bulur ve bir saat onun önünde durursun. Diğerleri teferruattır.", recipe:"Fırtınamı dindirmek için Vermeer'in sessiz \"Süt Döken Kadın\" tablosunu hatırla. Hayat her zaman varoluş savaşı değildir." },
  melankolik: { key:"melankolik", label:"MELANKOLİK ESTET", tagline:"Kalabalıkların alkışındansa, yüce bir yalnızlığın fısıltısını tercih ederim.", subtitle:"İçe Dönük Gözlemci", palette:["#B0B8BF","#1C3D5A","#D4CFC8"], paletteNames:["Sis Grisi","Prusya Mavisi","Soluk Ay Işığı"], era:"1800'ler Almanya'sı", eraDesc:"Romantizm'in, felsefenin ve şiirin sokaklara taştığı, doğaya sığınılan dönem.", soulArt:"Bulutların Üzerinde Yolculuk — C.D. Friedrich", soulWhy:"Zirvede, tek başına, sonsuz sis denizini izleyen o figür sensin. Evrenin yüceliği karşısında küçüklük sana huzur verir.", channel:"İşitsel ve İçsel", channelDesc:"Dış dünyanın sesini kısıp iç sesini dinlersin. Estetik algın sessizlikte ve boşluklarda gizlidir.", analysis:"Sen kalabalıklarda bile kendi adasında yaşayan birisin. Dünyanın yüzeysel gürültüsü seni çok yorar. Anlam, eylemden her zaman daha önemlidir.", heel:"İzolasyon ve Eylemsizlik", heelDesc:"Zihninde o kadar güvenli bir kale kurdun ki, dışarı çıkıp hayatın risklerine karışmaktan korkuyorsun.", power:"Derin İçgörü", powerDesc:"Başkalarının bakıp geçtiği detaylarda bütün bir evreni görürsün. Sessizliğin boşluk değil, bilgeliktir.", museum:"Yalnız Gezgin", museumDesc:"Kulaklığını takarsın, kalabalık gruplardan kaçarsın. Eserle baş başa sessiz bir diyalog kurarsın.", recipe:"Sis denizinde kaybolduğunda Pieter Bruegel'in hareketli köy tablolarına bak. Hayatın gürültülü tarafına karışmaya ihtiyacın var." },
  sezgisel: { key:"sezgisel", label:"SEZGİSEL ESTET", tagline:"Gerçek sabit değildir; ışığın açısına göre her an yeni bir renge bürünür.", subtitle:"İzlenimci Ruh", palette:["#F2C4CE","#A8D5BA","#C8B2D6"], paletteNames:["Pastel Pembe","Su Yeşili","Lila"], era:"1870'ler Paris'i", eraDesc:"Geniş bulvarlar, nehir kenarı piknikleri, kafeler ve yaşama sevinci. Belle Époque.", soulArt:"İzlenim: Gün Doğumu — Claude Monet", soulWhy:"Net çizgiler, keskin sınırlar ve katı kurallar yoktur. Sadece anın uçucu hissi ve sabahın umudu vardır.", channel:"Duyusal ve Sezgisel", channelDesc:"Kokular, tatlar, atmosfer senin hafızanı oluşturur. Olayları ilk izlenimle kavrarsın.", analysis:"Sen anda yaşayan bir ruhsun. Katı planlar sana göre değil. Monet'nin nilüferleri gibi akışkan ve değişkensin. Hayatın tadını çıkarmayı çok iyi bilirsin.", heel:"Odaklanma Sorunu", heelDesc:"Zorluklarla yüzleşmek yerine gerçeği flulaştırma eğilimin var. Çabuk sıkılma en büyük tuzağın.", power:"Akışta Kalmak", powerDesc:"Değişime en hızlı ayak uyduran sensin. Planlar bozulduğunda yeni rotanın tadını çıkarırsın.", museum:"Plansız Gezgin (Flaneur)", museumDesc:"Gözüne hangi renk güzel geliyorsa o yöne saparsın. Eserin verdiği ilk hissi alıp yoluna devam edersin.", recipe:"Sürekli yüzeyde yüzmek seni yoracak. Rembrandt'ın karanlık otoportrelerine bak. Tek bir duygunun dibine inme cesaretini göster." },
  isyankar: { key:"isyankar", label:"İSYANKAR ESTET", tagline:"Uyum ve düzen sadece korkakların sığınağıdır; asıl cesaret kendi kaosunu kucaklamaktır.", subtitle:"Kural Yıkıcı Ruh", palette:["#003DA5","#CC5500","#F4C430"], paletteNames:["Kobalt Mavisi","Yanık Turuncu","Ayçiçeği Sarısı"], era:"1900'lerin Başı", eraDesc:"Kuralların yıkıldığı, bireyselliğin en yüksek sesle haykırıldığı Ekspresyonizm dönemi.", soulArt:"Yıldızlı Gece — Vincent van Gogh", soulWhy:"O tabloda gökyüzü bile yerinde duramıyor. İçsel enerjin ve fırtınaların da tıpkı o yıldızlar gibi hem parlak hem yakıcı.", channel:"Kinestetik ve Ritmik", channelDesc:"Yerinde duramazsın. Dünyayı fiziksel enerji ve ritim üzerinden algılarsın. Dünyan sürekli hareket halindedir.", analysis:"Sen bir statüko düşmanısın. Var olan düzen, kalıplar ve 'normal' denen her şey seni boğar. İçinde dinmek bilmeyen bir enerji var.", heel:"Dürtüsellik ve Yıkıcılık", heelDesc:"Enerjini kontrol edemediğinde kendini de yakabilirsin. Sabırsızlık ve anlık parlamalar en büyük düşmanın.", power:"Yaratıcı Dönüşüm (Katharsis)", powerDesc:"Yoğun ve karanlık duygulardan muazzam güç yaratma yeteneğin var. Yıkıntılardan yeni dünya çıkarabilirsin.", museum:"Dürtüsel ve Seçici", museumDesc:"Enerji vermeyen eserin önünde bir saniye bile durmazsın. Seni provoke edeni bulana kadar durmazsın.", recipe:"Volkanik enerjin köklerini yakıyor. Cézanne'ın dingin elma natürmortlarına bak. Bazen durmak, dünyayı yakmaktan daha büyük devrimdir." },
};

const QUESTIONS = [
  { id:1, text:"Çok yorgun ve zihnen dolu olduğun bir gündesin. Gözlerini kapattığında seni anında sakinleştirecek o 'ideal manzara' hangisi?", options:[{key:"A",text:"Geometrik, simetrik, her ağacın kusursuz hizalandığı bir Rönesans bahçesi.",type:"analitik"},{key:"B",text:"Dalgaların kayaları dövdüğü, gökyüzünün gri ve hırçın olduğu vahşi bir uçurum kenarı.",type:"tutkulu"},{key:"C",text:"Zirvesi bulutların üzerinde kalan, ıssız, sessiz ve uçsuz bucaksız bir dağ manzarası.",type:"melankolik"},{key:"D",text:"Sisli, sınırları belirsiz, rüya gibi yumuşak ışıklı, su kenarında bir nilüfer bahçesi.",type:"sezgisel"},{key:"E",text:"Renklerin birbirine karıştığı, enerjik, hareketli ve kuralların olmadığı kaotik bir gece gökyüzü.",type:"isyankar"}] },
  { id:2, text:"Karanlık, sadece cılız bir mum ışığıyla aydınlanan büyük bir odadasın. Köşelerdeki karanlığı göremiyorsun. Bu durum sana ne hissettiriyor?", options:[{key:"A",text:"Rahatsızlık: Hemen ışığı açıp her detayı netleştirmek, belirsizliği tamamen yok etmek isterim.",type:"analitik"},{key:"B",text:"Gerilim ve Tutku: O karanlık boşluklar aydınlıktan daha çekicidir. Orada yüzleşilmesi gereken bir hikaye saklıdır.",type:"tutkulu"},{key:"C",text:"Huzur: Odanın sınırlarının kaybolması bana sonsuzluk hissi verir. Kendi içime dönmek için güvenli bir loşluktur.",type:"melankolik"},{key:"D",text:"Merak: Işığın eşyalara nasıl vurduğunu, odanın atmosferini ve bana hissettirdiği o ilk izlenimi incelerim.",type:"sezgisel"},{key:"E",text:"Meydan Okuma: O karanlığın içine dalıp, orada gizlenen ne varsa onu kendi ellerimle açığa çıkarmak isterim.",type:"isyankar"}] },
  { id:3, text:"Bir portre ressamısın. Modelinin yüzünde çok derin bir yara izi var. Fırçayı eline aldığında ne yaparsın?", options:[{key:"A",text:"İyileştiririm: O izi estetik bir kompozisyonla gizler, altın orana uyan ideal ve kusursuz bir yüz çizerim.",type:"analitik"},{key:"B",text:"Vurgularım: Işığı tam o yaranın üzerine düşürürüm. Gerçek ne kadar sert ve acımasızsa, o kadar güzeldir.",type:"tutkulu"},{key:"C",text:"Sembolize Ederim: Yarayı çizerim ama ona hüzünlü ve derin bir anlam yükleyerek melankolisini resmederim.",type:"melankolik"},{key:"D",text:"Flulaştırırım: Yaraya odaklanmam, modelin o anki enerjisine, bakışına ve ortamdaki ışığa odaklanırım.",type:"sezgisel"},{key:"E",text:"Parçalarım: O yarayı tüm yüzü kaplayacak kadar abartır, formları bozarak öfkeyi tuvale kusarım.",type:"isyankar"}] },
  { id:4, text:"Çok sevdiğin bir sanat eserine bakıyorsun. Eğer o eserin bir sesi olsaydı, sence ne duyulurdu?", options:[{key:"A",text:"Kusursuz bir matematikle yazılmış, her notası yerli yerinde olan klasik bir konçerto.",type:"analitik"},{key:"B",text:"Büyük bir orkestranın aniden yükselen, coşkulu, tüyler ürperten dramatik final notaları.",type:"tutkulu"},{key:"C",text:"Derin bir sessizlik. Sadece uzaktan gelen rüzgarın veya yalnız bir çellonun tekdüze melodisi.",type:"melankolik"},{key:"D",text:"Kuş sesleri, su şırıltısı veya kalabalık bir Paris kafesinin hafif, uğultulu ritmi.",type:"sezgisel"},{key:"E",text:"Karmaşık, ritmi bozuk, bazen hızlanan bazen duran, kuralları yıkan deneysel bir melodi.",type:"isyankar"}] },
  { id:5, text:"Bir sanat eserini incelerken veya derin bir sohbetteyken seni en çok ne etkiler?", options:[{key:"A",text:"İçerik ve Mantık: Ne anlattığı, hikayenin netliği, altındaki tarihi veya rasyonel temeller.",type:"analitik"},{key:"B",text:"Tonlama ve Yüzleşme: Ne dediği değil, nasıl dediği. Sesindeki titreme, acı veya çıplak dürüstlük.",type:"tutkulu"},{key:"C",text:"Esler ve Boşluklar: Söylenmeyenler, suskunluklar ve satır aralarındaki o derin yalnızlık.",type:"melankolik"},{key:"D",text:"Atmosfer ve Enerji: Konuşmanın içeriğinden ziyade, o anki sohbetin akışı ve verdiği his.",type:"sezgisel"},{key:"E",text:"İtiraz ve Aykırılık: Beklenmedik bir çıkış yapması, tabuları yıkması ve sarsıcı iddia ortaya atması.",type:"isyankar"}] },
  { id:6, text:"Bir müzedesin. Önünde duran heykele dokunman yasak ama içinden inanılmaz bir dürtü geliyor. Eserin dokusunun nasıl olmasını isterdin?", options:[{key:"A",text:"Soğuk, pürüzsüz, kusursuzca parlatılmış mermerin o cam gibi mükemmel hissi.",type:"analitik"},{key:"B",text:"Pütürlü, yontulmamış, sanatçının tutkulu parmak izlerini taşıyan o ham ve gerçek doku.",type:"tutkulu"},{key:"C",text:"Zamanın aşındırdığı, çatlaklarla dolu, yüzyılların hüznünü taşıyan o yaşlı yüzey.",type:"melankolik"},{key:"D",text:"Sıcak, yumuşak, ışığı içine çeken ve organik hissettiren o akışkan doku.",type:"sezgisel"},{key:"E",text:"Keskin, köşeli, elime battığında canımı hafifçe acıtacak o tehlikeli ve asi metal form.",type:"isyankar"}] },
  { id:7, text:"Seni derinden etkileyen bir sanat eseriyle karşılaştığında vücudun ilk ne tepki verir?", options:[{key:"A",text:"Gözlerim dalar, hareket etmeden kilitlenir ve zihnimde oranları analiz ederim.",type:"analitik"},{key:"B",text:"Tüylerim ürperir, sırtımdan aşağı bir elektrik akımı geçer ve kalp atışım değişir.",type:"tutkulu"},{key:"C",text:"Derin bir nefes alıp donakalırım, dünyayla iletişimimi tamamen keserim.",type:"melankolik"},{key:"D",text:"Omuzlarımdaki yük kalkar, gevşerim ve o anın verdiği enerjiyle gülümserim.",type:"sezgisel"},{key:"E",text:"Yerimde duramam, içimde bir enerji patlaması olur; yürümek veya fiziksel tepki vermek isterim.",type:"isyankar"}] },
  { id:8, text:"Hayatında işler kontrolden çıktığında ilk tepkin ne olur?", options:[{key:"A",text:"Durdururum: Her şeyi askıya alır, duygularımı dondurur ve rasyonel bir planla yeniden inşa ederim.",type:"analitik"},{key:"B",text:"İçine Dalarım: Krizin tam ortasına atlar, o anki yoğun öfke veya tutkuyla korkusuzca yüzleşirim.",type:"tutkulu"},{key:"C",text:"Geri Çekilirim: Kendi içime kapanır, duvarlarımı örer ve bu fırtınanın sessizce geçmesini beklerim.",type:"melankolik"},{key:"D",text:"Akışına Bırakırım: Fazla direnmem, kaosun beni nereye götüreceğini izler ve yeni rotaya adapte olurum.",type:"sezgisel"},{key:"E",text:"Parçalarım: Var olan tüm kuralları çöpe atar, krizimden sarsıcı ve yepyeni bir yol yaratırım.",type:"isyankar"}] },
  { id:9, text:"Potansiyelini gerçekleştirmene engel olan o 'Karanlık Ses' sana en çok ne söyler?", options:[{key:"A",text:"\"Ya kusursuz olmazsa? En iyisini, en hatasızını yapamayacaksan hiç başlama.\"",type:"analitik"},{key:"B",text:"\"Her şeyi o kadar uçlarda yaşıyorsun ki, artık dayanacak enerjin kalmadı. Yanacaksın.\"",type:"tutkulu"},{key:"C",text:"\"Bunu yapsan ne değişecek ki? Dünya zaten anlaşılmaz bir yer, çabalamaya değer mi?\"",type:"melankolik"},{key:"D",text:"\"Çok fazla seçenek var, sıkılacaksın. Neden buna saplanıp kalasın?\"",type:"sezgisel"},{key:"E",text:"\"Kimse seni anlamıyor! O kuralları takip etmek zorunda değilsin, hepsini yak gitsin!\"",type:"isyankar"}] },
  { id:10, text:"Gözlerini kapat. Zihninde ıssız bir sahil kenarında yürüdüğünü hayal et. İlk ve en baskın hissettiğin şey nedir?", options:[{key:"A",text:"Geometri: Ufuk çizgisinin netliği, dalgaların matematiksel ritmi ve manzaranın kusursuz perspektifi.",type:"analitik"},{key:"B",text:"Yoğunluk: Suyun tenime değen dondurucu soğuğu veya yakıcı güneş gibi uç noktalar.",type:"tutkulu"},{key:"C",text:"Sessizlik: Etrafta kimsenin olmamasının verdiği o derin, hüzünlü ama yüce boşluk hissi.",type:"melankolik"},{key:"D",text:"Renk ve Işık: Suyun turkuazı, güneşin parıltısı ve anın verdiği o uçucu yaşama sevinci.",type:"sezgisel"},{key:"E",text:"Enerji: Rüzgarın yüzüme şiddetle çarpması ve doğanın o kontrol edilemez, vahşi gücü.",type:"isyankar"}] },
];

const ease = "cubic-bezier(.4,0,.2,1)";
const UNLOCK_COOKIE = "gorsel_algi_unlocked";

function hasCookie(name: string) {
  return document.cookie.includes(name + "=1");
}
function setCookie(name: string, days: number) {
  document.cookie = `${name}=1; max-age=${days * 86400}; path=/`;
}

function ProgressDots({ total, current, answered }: { total: number; current: number; answered: number }) {
  return (
    <div style={{display:"flex",gap:6,justifyContent:"center",padding:"16px 0"}}>
      {Array.from({length:total}).map((_,i)=>(
        <div key={i} style={{width:i===current?28:8,height:8,borderRadius:99,background:i<answered?BRAND.coral:i===current?BRAND.coral:BRAND.border,opacity:i<answered?.5:1,transition:`all .4s ${ease}`}}/>
      ))}
    </div>
  );
}

function PaletteChip({color,name}: {color: string; name: string}) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <div style={{width:36,height:36,borderRadius:99,background:color,border:`1px solid ${BRAND.border}`,flexShrink:0}}/>
      <span style={{fontSize:14,color:BRAND.warm}}>{name}</span>
    </div>
  );
}

function SectionCard({icon,title,children,accent}: {icon: string; title: string; children: React.ReactNode; accent?: string}) {
  return (
    <div style={{background:"#fff",borderRadius:20,padding:"28px 24px",border:`1px solid ${BRAND.border}`,position:"relative",overflow:"hidden"}}>
      {accent&&<div style={{position:"absolute",top:0,left:0,right:0,height:3,background:accent,borderRadius:"20px 20px 0 0"}}/>}
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
        <span style={{fontSize:20}}>{icon}</span>
        <span style={{fontSize:13,fontWeight:700,textTransform:"uppercase",letterSpacing:1.5,color:BRAND.muted}}>{title}</span>
      </div>
      {children}
    </div>
  );
}

export default function GorselAlgiTesti() {
  const [phase, setPhase] = useState("intro");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);
  const [resultType, setResultType] = useState<string | null>(null);
  const [fadeIn, setFadeIn] = useState(true);

  // Email gate states
  const [accessGranted, setAccessGranted] = useState(false);
  const [email, setEmail] = useState("");
  const [kvkkChecked, setKvkkChecked] = useState(false);
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "done" | "error" | "registered">("idle");

  // Check auth + cookie on mount
  useEffect(() => {
    async function checkAccess() {
      // Check cookie first (fast path)
      if (hasCookie(UNLOCK_COOKIE)) {
        setAccessGranted(true);
        return;
      }
      // Check Supabase auth
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setAccessGranted(true);
        }
      } catch {
        // Not logged in, no access
      }
    }
    checkAccess();
  }, []);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const handleSelect = (optType: string, optKey: string) => {
    if (animating) return;
    setSelected(optKey);
    setAnimating(true);
    const na = { ...answers, [current]: optType };
    setAnswers(na);
    setTimeout(() => {
      if (current < QUESTIONS.length - 1) {
        setFadeIn(false);
        setTimeout(() => {
          setCurrent(current + 1);
          setSelected(null);
          setAnimating(false);
          setFadeIn(true);
          scrollTop();
        }, 300);
      } else {
        const c: Record<string, number> = {};
        Object.values(na).forEach(t => { c[t] = (c[t] || 0) + 1; });
        setResultType(Object.entries(c).sort((a, b) => b[1] - a[1])[0][0]);
        setPhase("result");
        scrollTop();
      }
    }, 600);
  };

  const handleEmailSubmit = async () => {
    if (!email || !kvkkChecked || emailStatus === "sending" || !resultType) return;
    setEmailStatus("sending");
    try {
      const res = await fetch("/api/quiz/gorsel-algi-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          resultType,
        }),
      });
      const data = await res.json();
      if (data.registered) {
        setEmailStatus("registered");
      } else if (data.sent) {
        setEmailStatus("done");
        setAccessGranted(true);
        setCookie(UNLOCK_COOKIE, 365);
      } else {
        setEmailStatus("error");
      }
    } catch {
      setEmailStatus("error");
    }
  };

  const restart = () => {
    setPhase("intro");
    setCurrent(0);
    setAnswers({});
    setSelected(null);
    setAnimating(false);
    setResultType(null);
    setFadeIn(true);
    scrollTop();
  };

  const answered = Object.keys(answers).length;

  if (phase === "intro") return (
    <div style={{minHeight:"100vh",background:BRAND.cream,fontFamily:"'Segoe UI','Helvetica Neue',sans-serif"}}>
      <div style={{maxWidth:640,margin:"0 auto",padding:"96px 24px 60px",display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center"}}>
        <div style={{background:BRAND.coralLight,color:BRAND.coral,fontSize:12,fontWeight:700,letterSpacing:2,textTransform:"uppercase",padding:"8px 20px",borderRadius:99,marginBottom:32}}>Klemens Test</div>
        <h1 style={{fontSize:"clamp(28px,6vw,44px)",fontWeight:800,color:BRAND.dark,lineHeight:1.15,margin:"0 0 20px",letterSpacing:-.5}}>Görsel Algı ve<br/><span style={{color:BRAND.coral}}>Karakter Analizi</span></h1>
        <p style={{fontSize:17,lineHeight:1.7,color:BRAND.warm,margin:"0 0 12px",maxWidth:480}}>Sanat zevkiniz, karakteriniz ve dünyayı algılama biçiminiz birbiriyle bağlantılıdır.</p>
        <p style={{fontSize:17,lineHeight:1.7,color:BRAND.warm,margin:"0 0 40px",maxWidth:480}}><strong>10 soruda</strong> bilinçaltınızdaki estetik kodları çözüyoruz.</p>
        <div style={{display:"flex",gap:32,marginBottom:40,flexWrap:"wrap",justifyContent:"center"}}>
          {[{n:"10",l:"Soru"},{n:"5",l:"Karakter Tipi"},{n:"~4dk",l:"Süre"}].map((s,i)=>(
            <div key={i} style={{textAlign:"center"}}>
              <div style={{fontSize:28,fontWeight:800,color:BRAND.dark}}>{s.n}</div>
              <div style={{fontSize:13,color:BRAND.muted,marginTop:2}}>{s.l}</div>
            </div>
          ))}
        </div>
        <button
          onClick={()=>setPhase("quiz")}
          style={{background:BRAND.coral,color:"#fff",border:"none",borderRadius:99,padding:"18px 48px",fontSize:17,fontWeight:700,cursor:"pointer",boxShadow:`0 4px 24px ${BRAND.coralMid}`,fontFamily:"inherit",transition:`transform .2s ${ease}`}}
          onMouseEnter={e=>{(e.target as HTMLButtonElement).style.transform="translateY(-2px)"}}
          onMouseLeave={e=>{(e.target as HTMLButtonElement).style.transform="translateY(0)"}}
        >
          Teste Başla
        </button>
        <p style={{fontSize:12,color:BRAND.muted,marginTop:32,maxWidth:400,lineHeight:1.6,fontStyle:"italic"}}>Bu test, sanat ve estetik kuramlarından ilham alınarak keşif ve eğlence amacıyla hazırlanmıştır.</p>
      </div>
    </div>
  );

  if (phase === "quiz") {
    const q = QUESTIONS[current];
    return (
      <div style={{minHeight:"100vh",background:BRAND.cream,fontFamily:"'Segoe UI','Helvetica Neue',sans-serif"}}>
        <div style={{maxWidth:640,margin:"0 auto",padding:"96px 20px 60px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
            <span style={{fontSize:12,fontWeight:700,letterSpacing:1.5,color:BRAND.muted,textTransform:"uppercase"}}>Klemens Test</span>
            <span style={{fontSize:14,fontWeight:700,color:BRAND.coral}}>{current+1} / {QUESTIONS.length}</span>
          </div>
          <div style={{height:4,borderRadius:99,background:BRAND.border,marginBottom:8,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${((current+(selected?1:0))/QUESTIONS.length)*100}%`,background:BRAND.coral,borderRadius:99,transition:`width .6s ${ease}`}}/>
          </div>
          <ProgressDots total={QUESTIONS.length} current={current} answered={answered}/>
          <div style={{opacity:fadeIn?1:0,transform:fadeIn?"translateY(0)":"translateY(12px)",transition:`opacity .3s ${ease}, transform .3s ${ease}`}}>
            <div style={{background:"#fff",borderRadius:24,padding:"32px 28px",marginBottom:20,border:`1px solid ${BRAND.border}`,boxShadow:"0 2px 20px rgba(0,0,0,.04)"}}>
              <div style={{display:"inline-block",background:BRAND.coralLight,color:BRAND.coral,fontSize:13,fontWeight:800,padding:"4px 14px",borderRadius:99,marginBottom:16}}>Soru {q.id}</div>
              <p style={{fontSize:"clamp(16px,4vw,19px)",lineHeight:1.65,color:BRAND.dark,margin:0,fontWeight:500}}>{q.text}</p>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {q.options.map(opt => {
                const isSel = selected === opt.key;
                const isOth = selected && !isSel;
                return (
                  <button
                    key={opt.key}
                    onClick={()=>handleSelect(opt.type, opt.key)}
                    disabled={animating}
                    style={{display:"flex",alignItems:"flex-start",gap:14,background:isSel?BRAND.coral:"#fff",color:isSel?"#fff":BRAND.dark,border:`1.5px solid ${isSel?BRAND.coral:BRAND.border}`,borderRadius:16,padding:"18px 20px",fontSize:15,lineHeight:1.55,textAlign:"left",cursor:animating?"default":"pointer",opacity:isOth?.4:1,transform:isSel?"scale(1.01)":"scale(1)",transition:`all .35s ${ease}`,boxShadow:isSel?`0 4px 20px ${BRAND.coralMid}`:"0 1px 8px rgba(0,0,0,.03)",fontFamily:"inherit",width:"100%"}}
                    onMouseEnter={e=>{if(!animating&&!isSel){(e.currentTarget as HTMLButtonElement).style.borderColor=BRAND.coral;(e.currentTarget as HTMLButtonElement).style.transform="translateX(4px)"}}}
                    onMouseLeave={e=>{if(!isSel){(e.currentTarget as HTMLButtonElement).style.borderColor=BRAND.border;(e.currentTarget as HTMLButtonElement).style.transform="scale(1)"}}}
                  >
                    <span style={{width:30,height:30,borderRadius:99,background:isSel?"rgba(255,255,255,.25)":BRAND.coralLight,color:isSel?"#fff":BRAND.coral,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13,flexShrink:0,marginTop:1}}>{opt.key}</span>
                    <span>{opt.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "result" && resultType) {
    const r = TYPES[resultType];
    const img = IMAGES[resultType];
    const showFull = accessGranted;

    return (
      <div style={{minHeight:"100vh",background:BRAND.cream,fontFamily:"'Segoe UI','Helvetica Neue',sans-serif"}}>
        <div style={{maxWidth:640,margin:"0 auto",padding:"96px 20px 80px"}}>
          <div style={{textAlign:"center",marginBottom:24}}>
            <div style={{display:"inline-block",background:BRAND.coralLight,color:BRAND.coral,fontSize:11,fontWeight:800,letterSpacing:2,textTransform:"uppercase",padding:"6px 18px",borderRadius:99}}>Sanat Kişilik Analizin Tamamlandı</div>
          </div>

          {/* Hero card — locked unless email given */}
          <div style={{background:`linear-gradient(135deg, ${r.palette[0]}22, ${r.palette[1]}18, ${r.palette[2]}15)`,borderRadius:28,padding:"44px 32px",textAlign:"center",marginBottom:24,border:`1px solid ${BRAND.border}`,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",width:200,height:200,borderRadius:"50%",background:`${r.palette[1]}08`,top:-60,right:-40}}/>
            <div style={{position:"absolute",width:120,height:120,borderRadius:"50%",background:`${r.palette[2]}08`,bottom:-30,left:-20}}/>
            <p style={{fontSize:13,color:BRAND.muted,letterSpacing:1.5,textTransform:"uppercase",margin:"0 0 8px",fontWeight:600}}>Sanat Kişilik Analizin Hazır</p>
            {showFull ? (
              <>
                <h2 style={{fontSize:"clamp(26px,6vw,38px)",fontWeight:900,color:BRAND.dark,margin:"0 0 16px",letterSpacing:-.5,lineHeight:1.2}}>{r.label}</h2>
                <p style={{fontSize:17,fontStyle:"italic",color:BRAND.warm,margin:"0 0 24px",lineHeight:1.6,maxWidth:420,marginLeft:"auto",marginRight:"auto"}}>&ldquo;{r.tagline}&rdquo;</p>
                <div style={{display:"flex",justifyContent:"center",gap:8}}>
                  {r.palette.map((c,i)=>(<div key={i} style={{width:40,height:40,borderRadius:99,background:c,border:"3px solid #fff",boxShadow:"0 2px 8px rgba(0,0,0,.1)"}}/>))}
                </div>
              </>
            ) : (
              <>
                <h2 style={{fontSize:"clamp(26px,6vw,38px)",fontWeight:900,color:BRAND.dark,margin:"0 0 16px",letterSpacing:-.5,lineHeight:1.2,filter:"blur(12px)",userSelect:"none"}}>██████ ████</h2>
                <p style={{fontSize:17,fontStyle:"italic",color:BRAND.warm,margin:"0 0 24px",lineHeight:1.6}}>Sonucun hazır! Görmek için e-postanı gir.</p>
                <div style={{display:"flex",justifyContent:"center",gap:8}}>
                  {[BRAND.coral,"#999","#ccc"].map((c,i)=>(<div key={i} style={{width:40,height:40,borderRadius:99,background:c,border:"3px solid #fff",boxShadow:"0 2px 8px rgba(0,0,0,.1)",opacity:.3}}/>))}
                </div>
              </>
            )}
          </div>

          {/* Artwork image — fully locked */}
          <div style={{borderRadius:20,overflow:"hidden",marginBottom:24,border:`1px solid ${BRAND.border}`,position:"relative"}}>
            <Image
              src={img.src}
              alt={showFull ? img.alt : "Sonuç görseli"}
              width={640}
              height={400}
              style={{width:"100%",height:"auto",display:"block",filter:showFull?"none":"blur(20px)"}}
            />
            {!showFull && (
              <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(255,248,245,0.5)"}}>
                <div style={{background:"#fff",borderRadius:99,padding:"10px 24px",boxShadow:"0 2px 12px rgba(0,0,0,.1)",fontSize:14,fontWeight:700,color:BRAND.dark,display:"flex",alignItems:"center",gap:8}}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M12 6H4a1 1 0 00-1 1v6a1 1 0 001 1h8a1 1 0 001-1V7a1 1 0 00-1-1z" stroke={BRAND.coral} strokeWidth="1.5"/><path d="M5.5 6V4.5a2.5 2.5 0 015 0V6" stroke={BRAND.coral} strokeWidth="1.5" strokeLinecap="round"/></svg>
                  Sonucu Görmek İçin E-postanı Gir
                </div>
              </div>
            )}
          </div>

          {/* ── EMAIL GATE ── */}
          {!showFull && (
            <div style={{background:"#fff",borderRadius:24,padding:"36px 28px",border:`1px solid ${BRAND.border}`,marginBottom:24,boxShadow:"0 4px 24px rgba(0,0,0,.06)"}}>
              <div style={{textAlign:"center",marginBottom:24}}>
                <div style={{width:56,height:56,borderRadius:99,background:BRAND.coralLight,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M3 8l9 6 9-6" stroke={BRAND.coral} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><rect x="3" y="5" width="18" height="14" rx="2" stroke={BRAND.coral} strokeWidth="2"/></svg>
                </div>
                <h3 style={{fontSize:20,fontWeight:800,color:BRAND.dark,margin:"0 0 8px"}}>Sonucunu Aç</h3>
                <p style={{fontSize:15,color:BRAND.warm,margin:0,lineHeight:1.6}}>
                  Sanat profilin, karakter analizin, ruh eşi eserin ve süper gücün seni bekliyor.
                </p>
              </div>

              {emailStatus === "registered" ? (
                <div style={{textAlign:"center",padding:"16px 0"}}>
                  <p style={{fontSize:15,color:BRAND.warm,margin:"0 0 16px"}}>
                    Bu e-posta ile zaten üyesiniz!
                  </p>
                  <a
                    href="/club/giris"
                    style={{display:"inline-block",background:BRAND.coral,color:"#fff",border:"none",borderRadius:99,padding:"14px 36px",fontSize:15,fontWeight:700,textDecoration:"none",fontFamily:"inherit"}}
                  >
                    Giriş Yap
                  </a>
                </div>
              ) : emailStatus === "done" ? (
                <div style={{textAlign:"center",padding:"16px 0"}}>
                  <div style={{width:48,height:48,borderRadius:99,background:"rgba(34,197,94,.1)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <p style={{fontSize:16,fontWeight:700,color:BRAND.dark,margin:"0 0 4px"}}>Sonuçların Açıldı!</p>
                  <p style={{fontSize:14,color:BRAND.warm,margin:0}}>Detaylı analiz e-postana da gönderildi.</p>
                </div>
              ) : (
                <>
                  <div style={{display:"flex",flexDirection:"column",gap:12}}>
                    <input
                      type="email"
                      required
                      placeholder="E-posta adresiniz"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") handleEmailSubmit(); }}
                      style={{width:"100%",padding:"14px 18px",borderRadius:12,border:`1.5px solid ${BRAND.border}`,fontSize:15,color:BRAND.dark,background:"#fff",fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}
                    />
                    <label style={{display:"flex",alignItems:"flex-start",gap:8,cursor:"pointer"}}>
                      <input
                        type="checkbox"
                        checked={kvkkChecked}
                        onChange={e => setKvkkChecked(e.target.checked)}
                        style={{marginTop:3,accentColor:BRAND.coral}}
                      />
                      <span style={{fontSize:12,color:BRAND.muted,lineHeight:1.5}}>
                        <a href="/kvkk" target="_blank" rel="noopener noreferrer" style={{color:BRAND.coral,textDecoration:"underline"}}>KVKK Aydınlatma Metni</a>&apos;ni okudum ve kabul ediyorum.
                      </span>
                    </label>
                    {emailStatus === "error" && (
                      <p style={{fontSize:13,color:"#ef4444",margin:0}}>Bir hata oluştu. Lütfen tekrar deneyin.</p>
                    )}
                    <button
                      onClick={handleEmailSubmit}
                      disabled={emailStatus === "sending" || !kvkkChecked || !email}
                      style={{background:BRAND.coral,color:"#fff",border:"none",borderRadius:99,padding:"16px 0",fontSize:16,fontWeight:700,cursor:emailStatus==="sending"||!kvkkChecked||!email?"not-allowed":"pointer",opacity:emailStatus==="sending"||!kvkkChecked||!email?.5:1,fontFamily:"inherit",transition:`all .2s ${ease}`}}
                    >
                      {emailStatus === "sending" ? "Gönderiliyor..." : "Sonuçlarımı Gör"}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── FULL RESULTS (visible when access granted) ── */}
          {showFull && (
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              <SectionCard icon="🔍" title={`Karakter Analizi: ${r.subtitle}`} accent={r.palette[1]}>
                <p style={{fontSize:15,lineHeight:1.7,color:BRAND.warm,margin:0}}>{r.analysis}</p>
              </SectionCard>
              <SectionCard icon="👁️" title={`Algı Kanalın: ${r.channel}`}>
                <p style={{fontSize:15,lineHeight:1.7,color:BRAND.warm,margin:0}}>{r.channelDesc}</p>
              </SectionCard>
              <SectionCard icon="🎨" title="Ruh Eşi Eserin" accent={BRAND.coral}>
                <p style={{fontSize:18,fontWeight:700,color:BRAND.dark,margin:"0 0 8px"}}>{r.soulArt}</p>
                <p style={{fontSize:15,lineHeight:1.7,color:BRAND.warm,margin:0}}>{r.soulWhy}</p>
              </SectionCard>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                <SectionCard icon="⚡" title="Aşil Topuğun">
                  <p style={{fontSize:15,fontWeight:700,color:BRAND.dark,margin:"0 0 6px"}}>{r.heel}</p>
                  <p style={{fontSize:14,lineHeight:1.65,color:BRAND.warm,margin:0}}>{r.heelDesc}</p>
                </SectionCard>
                <SectionCard icon="💎" title="Süper Gücün">
                  <p style={{fontSize:15,fontWeight:700,color:BRAND.dark,margin:"0 0 6px"}}>{r.power}</p>
                  <p style={{fontSize:14,lineHeight:1.65,color:BRAND.warm,margin:0}}>{r.powerDesc}</p>
                </SectionCard>
              </div>
              <SectionCard icon="🎨" title="Renk Paletin">
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  {r.palette.map((c,i)=><PaletteChip key={i} color={c} name={r.paletteNames[i]}/>)}
                </div>
              </SectionCard>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                <SectionCard icon="🏛️" title="Ait Olduğun Dönem">
                  <p style={{fontSize:16,fontWeight:700,color:BRAND.dark,margin:"0 0 6px"}}>{r.era}</p>
                  <p style={{fontSize:14,lineHeight:1.65,color:BRAND.warm,margin:0}}>{r.eraDesc}</p>
                </SectionCard>
                <SectionCard icon="🗺️" title="Müze Gezme Tarzın">
                  <p style={{fontSize:16,fontWeight:700,color:BRAND.dark,margin:"0 0 6px"}}>{r.museum}</p>
                  <p style={{fontSize:14,lineHeight:1.65,color:BRAND.warm,margin:0}}>{r.museumDesc}</p>
                </SectionCard>
              </div>
              <div style={{background:`linear-gradient(135deg, ${BRAND.coral}08, ${BRAND.coral}04)`,borderRadius:20,padding:"28px 24px",border:`1px solid ${BRAND.coral}20`}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                  <span style={{fontSize:20}}>📜</span>
                  <span style={{fontSize:13,fontWeight:700,textTransform:"uppercase",letterSpacing:1.5,color:BRAND.coral}}>Klemens&apos;in Reçetesi</span>
                </div>
                <p style={{fontSize:15,lineHeight:1.75,color:BRAND.warm,margin:0,fontStyle:"italic"}}>{r.recipe}</p>
              </div>
            </div>
          )}

          {/* ── TEASER CARDS (blurred, when no access) ── */}
          {!showFull && (
            <div style={{position:"relative"}}>
              <div style={{display:"flex",flexDirection:"column",gap:16,filter:"blur(6px)",pointerEvents:"none",userSelect:"none"}}>
                <SectionCard icon="🔍" title="Karakter Analizi" accent={r.palette[1]}>
                  <p style={{fontSize:15,lineHeight:1.7,color:BRAND.warm,margin:0}}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                </SectionCard>
                <SectionCard icon="👁️" title="Algı Kanalın">
                  <p style={{fontSize:15,lineHeight:1.7,color:BRAND.warm,margin:0}}>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip.</p>
                </SectionCard>
                <SectionCard icon="🎨" title="Ruh Eşi Eserin" accent={BRAND.coral}>
                  <p style={{fontSize:18,fontWeight:700,color:BRAND.dark,margin:"0 0 8px"}}>Eser Adı</p>
                  <p style={{fontSize:15,lineHeight:1.7,color:BRAND.warm,margin:0}}>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.</p>
                </SectionCard>
              </div>
              <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <div style={{background:"#fff",borderRadius:16,padding:"20px 28px",boxShadow:"0 4px 24px rgba(0,0,0,.12)",textAlign:"center"}}>
                  <svg width="24" height="24" viewBox="0 0 16 16" fill="none" style={{margin:"0 auto 8px",display:"block"}}><path d="M12 6H4a1 1 0 00-1 1v6a1 1 0 001 1h8a1 1 0 001-1V7a1 1 0 00-1-1z" stroke={BRAND.coral} strokeWidth="1.5"/><path d="M5.5 6V4.5a2.5 2.5 0 015 0V6" stroke={BRAND.coral} strokeWidth="1.5" strokeLinecap="round"/></svg>
                  <p style={{fontSize:15,fontWeight:700,color:BRAND.dark,margin:"0 0 4px"}}>Sonuçların Kilitli</p>
                  <p style={{fontSize:13,color:BRAND.muted,margin:0}}>Yukarıdaki formu doldurarak aç</p>
                </div>
              </div>
            </div>
          )}

          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:16,marginTop:40,paddingTop:32,borderTop:`1px solid ${BRAND.border}`}}>
            <button
              onClick={restart}
              style={{background:BRAND.coral,color:"#fff",border:"none",borderRadius:99,padding:"16px 40px",fontSize:16,fontWeight:700,cursor:"pointer",boxShadow:`0 4px 24px ${BRAND.coralMid}`,fontFamily:"inherit",transition:`transform .2s ${ease}`}}
              onMouseEnter={e=>{(e.target as HTMLButtonElement).style.transform="translateY(-2px)"}}
              onMouseLeave={e=>{(e.target as HTMLButtonElement).style.transform="translateY(0)"}}
            >
              Testi Tekrar Çöz
            </button>
            <p style={{fontSize:12,color:BRAND.muted,fontStyle:"italic",textAlign:"center",maxWidth:360}}>Bu test, sanat ve estetik kuramlarından ilham alınarak keşif ve eğlence amacıyla hazırlanmıştır.</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
