# عاصمة الكون للمصاعد

موقع عربي احترافي لشركة عاصمة الكون، الوكيل المعتمد لمصاعد FUJI YEM.

## الملفات

- `index.html`: الموقع الرئيسي بتجربة مصعد 3D، الخدمات، الكتالوج، والاستبيان الذكي.
- `admin.html`: داشبورد لإدارة رقم الواتساب، بيانات التواصل، الخدمات، الكتالوج، الأسئلة، والطلبات المحلية.
- `supabase/schema.sql`: جدول الطلبات وسياسة إدخال الطلبات من الموقع.

## Supabase

1. أنشئ مشروع Supabase.
2. شغل محتوى `supabase/schema.sql` في SQL editor.
3. افتح `admin.html` وأدخل `Supabase URL` و `anon key`.
4. أي طلب جديد من الاستبيان سيتم حفظه محليا وإرساله إلى جدول `leads` عند تفعيل المفاتيح.

## الداشبورد

- رابط الإدارة: `/admin`
- كلمة المرور الافتراضية: `123456`
- تغيير كلمة المرور يتم من الداشبورد عبر إرسال لينك إلى واتساب الإدارة `01120442206`.
- مالك الموقع يفتح اللينك ويكتب كلمة المرور الجديدة فقط.
- في النسخة الحالية Static، كلمة المرور محفوظة في متصفح الإدارة. كلمة مرور مركزية لكل الأجهزة تحتاج Supabase/Auth أو Backend.

## Vercel

المشروع Static ولا يحتاج build command. يمكن نشره مباشرة على Vercel من الريبو.

### Vercel Supabase Environment Variables

Add these in Vercel Project Settings > Environment Variables:

```env
SUPABASE_URL=https://hplsbgghcusixvbiwdwi.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
```

The site reads them from `/api/config` at runtime and sends new inspection requests to the `leads` table.
