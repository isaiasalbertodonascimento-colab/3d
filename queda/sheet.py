# python3 sheet.py out.jpg t1 t2 ... -> folha de contato das prévias
import sys;from PIL import Image,ImageDraw
out=sys.argv[1];ts=sys.argv[2:];ims=[]
for t in ts:
  im=Image.open(f'preview/t{float(t):.2f}.jpg').resize((324,576));ImageDraw.Draw(im).text((8,8),t,fill='yellow');ims.append(im)
cols=min(6,len(ims));rows=(len(ims)+cols-1)//cols;W=Image.new('RGB',(324*cols,576*rows))
for i,im in enumerate(ims):W.paste(im,(324*(i%cols),576*(i//cols)))
W.save(out,quality=85)
