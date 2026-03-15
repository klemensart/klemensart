-- articles tablosuna INSERT yapıldığında otomatik story tasarımı oluşturur
-- Supabase SQL Editor'da çalıştırın

CREATE OR REPLACE FUNCTION auto_generate_story()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO designs (name, platform, width, height, canvas_data, thumbnail_url, is_template)
  VALUES (
    'Story — ' || NEW.title,
    'instagram-story',
    1080,
    1920,
    jsonb_build_object(
      'backgroundColor', '#FFFBF7',
      'objects', jsonb_build_array(
        jsonb_build_object('type','shape','x',0,'y',0,'width',1080,'height',1920,'fill','#FFFBF7','shapeType','rect','opacity',1,'rotation',0),
        jsonb_build_object('type','image','x',100,'y',90,'width',880,'height',620,'src',NEW.image,'cornerRadius',16,'opacity',1,'rotation',0),
        jsonb_build_object('type','shape','x',100,'y',750,'width',880,'height',1,'fill','#e8e4df','shapeType','rect','opacity',1,'rotation',0),
        jsonb_build_object('type','text','x',100,'y',785,'width',880,'text',UPPER(COALESCE(NEW.category,'ODAK')),'fontSize',43,'fontFamily','Montserrat','fontStyle','bold','fill','#ff6c5f','align','left','letterSpacing',12,'lineHeight',1.2,'opacity',1,'rotation',0),
        jsonb_build_object('type','text','x',100,'y',870,'width',840,'text',COALESCE(NEW.description,NEW.title),'fontSize',40,'fontFamily','Montserrat','fontStyle','normal','fill','#2c3e50','align','left','letterSpacing',0,'lineHeight',1.79,'opacity',1,'rotation',0),
        jsonb_build_object('type','text','x',100,'y',1280,'width',880,'text','— ' || COALESCE(NEW.author,'Klemens Art'),'fontSize',34,'fontFamily','Montserrat','fontStyle','italic','fill','#2c3e50','align','left','letterSpacing',0,'lineHeight',1.2,'opacity',1,'rotation',0)
      )
    ),
    NULL,
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Mevcut trigger varsa kaldır
DROP TRIGGER IF EXISTS trg_auto_story ON articles;

-- Trigger'ı oluştur
CREATE TRIGGER trg_auto_story
  AFTER INSERT ON articles
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_story();
