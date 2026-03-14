#!/bin/bash
# Kalan eser görsellerini Wikimedia'dan indir
# Kullanım: bash scripts/download-remaining-artworks.sh
# NOT: Wikimedia rate limit'e takılırsa birkaç saat sonra tekrar deneyin.

BASE="public/images/workshop/modern-sanat"
CONVERT="/opt/ImageMagick/bin/convert"

download() {
  local url="$1"
  local target="$2"

  if [ -f "$target" ] && [ -s "$target" ]; then
    return 0
  fi

  local tmpfile="/tmp/art-$(basename "$target" .webp).tmp"
  local status=$(curl -sL -o "$tmpfile" -w "%{http_code}" "$url")

  if [ "$status" = "200" ] && [ -s "$tmpfile" ]; then
    local ftype=$(file -b "$tmpfile")
    if echo "$ftype" | grep -qiE "jpeg|png|gif|webp|tiff|image|bitmap"; then
      $CONVERT "$tmpfile" -resize "800x800>" -quality 82 "$target" 2>/dev/null
      if [ -f "$target" ] && [ -s "$target" ]; then
        echo "OK: $(basename "$target")"
        rm -f "$tmpfile"
        return 0
      fi
    fi
  fi

  echo "FAIL ($status): $(basename "$target")"
  rm -f "$tmpfile"
  return 1
}

echo "Kalan görselleri indiriyorum..."
echo ""

# Week 2: Kübizm
download "https://upload.wikimedia.org/wikipedia/en/4/48/Pablo_Picasso%2C_1912%2C_Still_Life_with_Chair_Caning.jpg" "$BASE/week-2/chair-caning.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/en/a/a0/Juan_Gris_-_Breakfast.jpg" "$BASE/week-2/breakfast-gris.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/en/7/78/Braque_Woman_with_a_Guitar.jpg" "$BASE/week-2/woman-guitar-braque.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/en/e/ea/Robert_Delaunay_Simultaneous_Windows.jpg" "$BASE/week-2/simultaneous-windows.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/en/0/09/Picasso_Ma_Jolie_1911.jpg" "$BASE/week-2/ma-jolie.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/en/d/d4/Georges_Braque%2C_1908%2C_Maisons_%C3%A0_l%27Estaque_%28Houses_at_l%27Estaque%29.jpg" "$BASE/week-2/estaque-houses.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/en/6/6e/Juan_Gris_Glass_Guitar_Bottle.jpg" "$BASE/week-2/glass-guitar-gris.webp"
sleep 3

# Week 3: Dadaizm
download "https://upload.wikimedia.org/wikipedia/commons/7/77/HannahHoech-Cut_With_the_Kitchen_Knife.jpg" "$BASE/week-3/kitchen-knife.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/en/b/bc/Man_Ray_Gift_Cadeau.jpg" "$BASE/week-3/gift-manray.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/en/c/c1/Man_Ray_Rayograph_1922.jpg" "$BASE/week-3/rayograph.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/commons/5/59/Marcel_Duchamp%2C_Bicycle_Wheel%2C_1913.jpg" "$BASE/week-3/bicycle-wheel.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/commons/4/41/Hugo_ball_karawane.png" "$BASE/week-3/karawane.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/en/5/51/Man_Ray_Rope_Dancer.jpg" "$BASE/week-3/rope-dancer.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/en/b/b3/Sophie_Taeuber_Arp_Dada_Head.jpg" "$BASE/week-3/dada-head.webp"
sleep 3

# Week 4: Sürrealizm
download "https://upload.wikimedia.org/wikipedia/en/7/74/Max_Ernst_Europe_After_the_Rain_II.jpg" "$BASE/week-4/europe-after-rain.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/en/2/29/Meret_Oppenheim_Object.jpg" "$BASE/week-4/fur-cup.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/en/3/3a/Yves_Tanguy_Mama_Papa_is_Wounded.jpg" "$BASE/week-4/mama-papa.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/en/e/e5/Dorothea_Tanning_Birthday.jpg" "$BASE/week-4/birthday-tanning.webp"
sleep 3

# Week 5: De Stijl & Bauhaus
download "https://upload.wikimedia.org/wikipedia/commons/c/c9/Amsterdam_-_Stedelijk_Museum_-_Theo_van_Doesburg_%281883-1931%29_-_Counter-Composition_V_%28A_567%29_1924.jpg" "$BASE/week-5/counter-composition.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/commons/8/80/Kandinsky_-_Composition_8%2C_July_1923.jpg" "$BASE/week-5/composition-viii.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/commons/a/a6/Kandinsky_-_Jaune_Rouge_Bleu.jpg" "$BASE/week-5/yellow-red-blue.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/commons/d/df/Fire_in_the_Evening_by_Paul_Klee_in_the_MOMA.jpg" "$BASE/week-5/fire-evening.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/commons/a/a7/Rietveld_Schr%C3%B6derhuis_HayKranen-20.JPG" "$BASE/week-5/schroder-house.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/commons/0/0e/Vassily_Kandinsky%2C_1926_-_Several_Circles%2C_Gugg_0910_25.jpg" "$BASE/week-5/several-circles.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/commons/c/c3/Composition_A_by_Piet_Mondrian_Galleria_Nazionale_d%27Arte_Moderna_e_Contemporanea.jpg" "$BASE/week-5/composition-a.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/en/a/ae/Light_Space_Modulator_by_Moholy-Nagy.jpg" "$BASE/week-5/light-prop.webp"
sleep 3

# Week 6: Soyut Dışavurumculuk
download "https://upload.wikimedia.org/wikipedia/en/2/2a/Autumn_Rhythm.jpg" "$BASE/week-6/autumn-rhythm.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/en/1/16/Franz_Kline_Mahoning.jpg" "$BASE/week-6/mahoning.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/en/1/1c/Lee_Krasner_Milkweed.jpg" "$BASE/week-6/milkweed.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/en/a/a7/Robert_Motherwell_Elegy_to_the_Spanish_Republic.jpg" "$BASE/week-6/elegy-110.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/en/9/9e/Lavender_Mist.jpg" "$BASE/week-6/lavender-mist.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/en/a/a4/De_Kooning_Excavation.jpg" "$BASE/week-6/excavation.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/en/6/60/Barnett_Newman_Onement_1.jpg" "$BASE/week-6/onement-i.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/commons/2/23/Rothko_Chapel_-_1_August_2010.jpg" "$BASE/week-6/rothko-chapel.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/en/6/63/Lee_Krasner_The_Seasons.jpg" "$BASE/week-6/seasons-krasner.webp"
sleep 3

# Week 7: Pop Art
download "https://upload.wikimedia.org/wikipedia/en/b/b8/Roy_Lichtenstein_Whaam.jpg" "$BASE/week-7/whaam.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/en/7/73/Claes_Oldenburg_Floor_Burger.jpg" "$BASE/week-7/floor-burger.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/en/8/85/Yayoi-Kusama-Infinity-Room.jpg" "$BASE/week-7/infinity-room.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/en/1/1f/Brillo_Box_at_MOMA.jpg" "$BASE/week-7/brillo-boxes.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/commons/b/bc/LOVE_sculpture_NY.JPG" "$BASE/week-7/love-indiana.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/en/3/3e/Shot_Sage_Blue_Marilyn_by_Andy_Warhol.jpg" "$BASE/week-7/sage-blue-marilyn.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/commons/c/c0/Yayoi_Kusama%27s_pumpkin_on_Benesse_Art_Island_of_Naoshima%2C_Japan.jpg" "$BASE/week-7/pumpkin-kusama.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/en/5/56/Jasper_Johns%27s_%27Flag%27%2C_Encaustic%2C_oil_and_collage_on_fabric_mounted_on_plywood%2C1954-55.jpg" "$BASE/week-7/flag-johns.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/en/c/cc/Eduardo_Paolozzi_I_was_a_Rich_Man%27s_Plaything.jpg" "$BASE/week-7/rich-mans-plaything.webp"
sleep 3

# Week 8: Kavramsal Sanat
download "https://upload.wikimedia.org/wikipedia/commons/0/08/One_and_Three_Chair.jpg" "$BASE/week-8/one-three-chairs.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/en/d/db/Sol_LeWitt_Wall_Drawing.jpg" "$BASE/week-8/wall-drawing-118.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/en/1/11/Yoko_Ono_Cut_Piece.jpg" "$BASE/week-8/cut-piece.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/en/9/98/Marina_Abramovi%C4%87_The_Artist_Is_Present.jpg" "$BASE/week-8/artist-is-present.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/en/e/ec/On_Kawara_I_Got_Up.jpg" "$BASE/week-8/i-got-up.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/commons/2/26/Oct_31%2C_1973_%28Today_Series%2C_Tuesday%29_On_Kawara.png" "$BASE/week-8/date-paintings.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/en/1/1c/After_Walker_Evans_4%2C_1981%2C_Sherrie_Levine.jpeg" "$BASE/week-8/levine-fountain.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/en/b/bd/Marina_Abramovic_Rhythm_0.jpg" "$BASE/week-8/rhythm-0.webp"
sleep 3

# Week 9: Arazi & Performans Sanatı
download "https://upload.wikimedia.org/wikipedia/en/1/18/Lightning_field.jpg" "$BASE/week-9/lightning-field.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/commons/b/b9/The_Gates%2C_a_site-specific_work_of_art_by_Christo_and_Jeanne-Claude_in_Central_Park%2C_New_York_City_LCCN2011633978.jpg" "$BASE/week-9/the-gates.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/en/5/56/Olafur_Eliasson_The_Weather_Project.jpg" "$BASE/week-9/weather-project.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/commons/b/b7/Nancy_Holt%2C_Sun_Tunnels%2C_1973-1976.jpg" "$BASE/week-9/sun-tunnels.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/en/b/b1/Agnes_Denes_Tree_Mountain.jpg" "$BASE/week-9/tree-mountain.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/en/2/25/Untitled_%28Your_body_is_a_battleground%29_1989.jpg" "$BASE/week-9/your-body.webp"
sleep 3

# Week 10: Güncel Sanat
download "https://upload.wikimedia.org/wikipedia/en/5/51/Untitled_acrylic_and_mixed_media_on_canvas_by_Jean-Michel_Basquiat_1981.jpg" "$BASE/week-10/basquiat-skull.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/en/5/53/Banksy_Girl_and_Heart_Balloon_%282840632113%29.jpg" "$BASE/week-10/girl-balloon.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/en/f/ff/Kara_Walker_A_Subtlety.jpg" "$BASE/week-10/a-subtlety.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/en/c/c3/Ai_Weiwei_Dropping_a_Han_Dynasty_Urn.jpg" "$BASE/week-10/dropping-urn.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/en/0/09/Hirst_Diamond_Skull.jpg" "$BASE/week-10/love-of-god.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/commons/c/c1/Cloud_Gate_%28The_Bean%29_from_east%27.jpg" "$BASE/week-10/cloud-gate.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/en/6/6a/Maurizio_Cattelan_Comedian.jpg" "$BASE/week-10/comedian.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/commons/c/cf/Shibboleth_Tate_Modern.jpg" "$BASE/week-10/shibboleth.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/en/3/30/Murakami_My_Lonesome_Cowboy.jpg" "$BASE/week-10/lonesome-cowboy.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/en/1/13/Barbara_Kruger_Untitled_We_dont_need_another_hero.jpg" "$BASE/week-10/another-hero.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/en/b/b3/Banksy_Flower_Thrower.jpg" "$BASE/week-10/flower-thrower.webp"
sleep 3
download "https://upload.wikimedia.org/wikipedia/commons/1/12/Puppy_de_Jeff_Koons_--_2021_--_Bilbao%2C_Espa%C3%B1a.jpg" "$BASE/week-10/puppy-koons.webp"

echo ""
echo "=== SONUÇ ==="
total=$(find "$BASE" -name "*.webp" -type f | wc -l | tr -d ' ')
echo "Toplam: $total görsel"
for w in $(seq 1 10); do
  count=$(find "$BASE/week-$w" -name "*.webp" -type f 2>/dev/null | wc -l | tr -d ' ')
  echo "  Week $w: $count"
done

# Fix: vir-heroicus was too small
download "https://upload.wikimedia.org/wikipedia/en/6/62/Barnett_Newman_Vir_Heroicus_Sublimis.jpg" "$BASE/week-6/vir-heroicus.webp"
