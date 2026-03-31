import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Terms() {
  return (
    <>
      <Navbar />
      <main className="flex-1 py-12 md:py-20" dir="rtl">
        <div className="mx-auto max-w-3xl px-5 md:px-8">
          <h1 className="text-2xl font-bold text-neutral-900 md:text-4xl dark:text-white">
            الأحكام والشروط
          </h1>
          <div className="mt-8 space-y-8 text-sm leading-relaxed text-neutral-700 md:text-base dark:text-neutral-300">
            <p>
              نظراً لرغبة المؤجر في تفويض الوسيط العقاري مكتب النخبة الأمثل
              للعقار للقيام بالوساطة لتأجير العقار في هذه الاتفاقية فقد التقت
              رغبة الطرفين وهما بكامل الاهلية الشرعية على ابرام اتفاقية وساطة
              عقارية بينهما حسب المواد التالية:
            </p>

            <section>
              <h2 className="mb-3 text-lg font-bold text-neutral-900 md:text-xl dark:text-white">
                المادة الأولى: التزامات المؤجر
              </h2>
              <ul className="space-y-3 pr-4">
                <li>
                  <span className="font-semibold">١/١</span> يلتزم المؤجر بأن
                  المعلومات التي قام بإدخالها الى تطبيق عقدي صحيحة كما يقر بانه
                  مالك للعقار أو مفوض تفويضاً رسمياً بتأجير العقار للغير كما يقر
                  بأنه اطلع على التزامات المؤجر في عقد الايجار الموحد.
                </li>
                <li>
                  <span className="font-semibold">١/٢</span> يلتزم المؤجر بتسليم
                  الوثائق والمعلومات الورقية اللازمة لإتمام هذه الاتفاقية للوسيط
                  اذا دعت الحاجة لذلك.
                </li>
                <li>
                  <span className="font-semibold">١/٣</span> يلتزم المؤجر بإعلام
                  الوسيط في حال انتقال ملكية العقار لطرف آخر وذلك خلال الايام
                  الثلاثة التالية لاعتماد انتقال الملكية لذلك الطرف.
                </li>
                <li>
                  <span className="font-semibold">١/٤</span> يقر المؤجر بعلمه بأن
                  المقابل المالي وقيمة السعي غير مسترده في حال تم تسجيل العقد
                  وتوثيقه في شبكة ايجار.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-bold text-neutral-900 md:text-xl dark:text-white">
                المادة الثانية: التزامات الوسيط
              </h2>
              <ul className="space-y-3 pr-4">
                <li>
                  <span className="font-semibold">٢/١</span> أن يقوم بأداء
                  الوساطة حسب الأنظمة والأعراف المتبعة.
                </li>
                <li>
                  <span className="font-semibold">٢/٢</span> أن يقوم بتحديث
                  بيانات المؤجر وذلك في حال تحقق الحالة المشار اليها في ١/٣ في
                  هذه الاتفاقية.
                </li>
                <li>
                  <span className="font-semibold">٢/٣</span> أن يلتزم بالمحافظة
                  على الوثائق والمعلومات التي تسلمها من المؤجر كما يلتزم
                  بالمحافظة على سرية أية معلومات تخص العقار أو المستأجرين.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-bold text-neutral-900 md:text-xl dark:text-white">
                المادة الثالثة: الإشعارات
              </h2>
              <p>
                يتم تبادل كافة الخطابات والاشعارات والمستندات المتعلقة بتنفيذ
                أعمال هذه الاتفاقية عن طريق البريد الالكتروني أو من خلال تطبيق
                عقدي.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-bold text-neutral-900 md:text-xl dark:text-white">
                المادة الرابعة: تسوية الخلاف
              </h2>
              <p>
                كل خلاف ينشأ بين الطرفين يتم حله ودياً خلال خمسة ايام من اخطار
                احد الطرفين الاخر بموضوع النزاع على ان تتم الاخطارات حسب ما جاء
                في المادة الثالثة وإن لم يتم الحل ودياً خلال المدة المقررة للطرف
                المتضرر حق اللجوء للجهات القضائية المختصة.
              </p>
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/40 dark:bg-amber-950/30">
                <p className="font-semibold text-amber-800 dark:text-amber-300">
                  الاسترجاع وإلغاء الطلب:
                </p>
                <p className="mt-2 text-amber-700 dark:text-amber-400">
                  في حال لم يتم توثيق العقد يحق للعميل طلب استرجاع رسوم إيجار
                  فقط ولا يحق له المطالبة برسوم الوسيط العقاري وذلك لأنه يتم سحب
                  المبلغ للوسيط مباشرة. وفي حال أتممنا الطلب وتم توثيق العقد لا
                  يحق للعميل المطالبة بأي مبالغ.
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-bold text-neutral-900 md:text-xl dark:text-white">
                المادة الخامسة: التغييرات التي تطرأ على اتفاقية الوساطة العقارية
              </h2>
              <p>
                يمتلك عقدي حرية التصرف في تحديث اتفاقية الوساطة العقارية هذه في
                أي وقت. وعندما نقوم بذلك، على المستخدم مراجعة تاريخ التحديث أسفل
                هذه الصفحة، لذا نحث المستخدمين على مراجعة اتفاقية الوساطة
                العقارية وأن يقر ويوافق المستخدم على مسؤوليته في مراجعة اتفاقية
                الوساطة العقارية هذه بشكل دوري وإدراكه للتعديلات.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-bold text-neutral-900 md:text-xl dark:text-white">
                للتواصل معنا
              </h2>
              <p>
                إذا كان لديك أي أسئلة بشأن اتفاقية الوساطة العقارية هذه، يمكنكم
                التواصل معنا من خلال{" "}
                <a
                  href="tel:0563214000"
                  className="font-bold text-emerald-600 hover:underline dark:text-emerald-400"
                  dir="ltr"
                >
                  0563214000
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
