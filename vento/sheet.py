import sys,glob
from PIL import Image,ImageDraw
fs=sorted(glob.glob('preview/t*.jpg'),key=lambda p:float(p[9:-4]))
cols=6;w,h=270,480;rows=(len(fs)+cols-1)//cols
S=Image.new('RGB',(cols*w,rows*h),'black')
for i,p in enumerate(fs):
    im=Image.open(p).resize((w,h));S.paste(im,((i%cols)*w,(i//cols)*h));ImageDraw.Draw(S).text(((i%cols)*w+6,(i//cols)*h+6),p[9:-4],fill='red')
S.save(sys.argv[1] if len(sys.argv)>1 else 'preview/sheet.png')
