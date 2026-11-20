export type SupportedLocale = 'en' | 'bn' | 'hi' | 'ur';

export interface TranslationDictionary {
  [key: string]: string;
}

const translations: Record<SupportedLocale, TranslationDictionary> = {
  en: {
    forbidden_underage: 'You must be 18 years of age or older to use SMACKGYM',
    ssrf_target_blocked: 'Access to private, loopback, or metadata address is strictly prohibited',
    insufficient_permissions: 'You do not have sufficient permissions to access this resource',
    unauthorized: 'Authentication required. Please provide a valid Bearer token',
    not_found: 'The requested resource was not found',
    rate_limit_exceeded: 'Too many requests. Please try again later',
    token_budget_exceeded: 'Daily AI coaching token budget exceeded',
    ai_kill_switch_active: 'AI coaching is temporarily disabled by emergency kill switch',
    invalid_credentials: 'The email address or password you entered is incorrect',
    email_already_registered: 'An account with this email address already exists',
    validation_failed: 'Request validation failed',
    institutional_domain_mismatch: 'Email does not match any accredited UK university domain (@*.ac.uk)',
    institutional_seats_exhausted: 'All allocated seats for this institution have been exhausted',
    ramadan_suhoor_reminder: 'Suhoor hydration window active: Drink 30% of daily target before Fajr.',
    ramadan_iftar_reminder: 'Iftar hydration window active: Rehydrate with 70% of daily target after sunset.',
    luteal_deload_notice: 'High-symptom luteal phase detected. Training volume reduced by 25%.',
    safety_hold_notice: 'Medical safety hold triggered. Loaded movement patterns restricted.',
  },
  bn: {
    forbidden_underage: 'SMACKGYM ব্যবহার করতে আপনার বয়স ১৮ বছর বা তার বেশি হতে হবে',
    ssrf_target_blocked: 'ব্যক্তিগত, লুপব্যাক বা মেটাডেটা ঠিকানায় অ্যাক্সেস সম্পূর্ণ নিষিদ্ধ',
    insufficient_permissions: 'এই সংস্থানে অ্যাক্সেস করার জন্য আপনার পর্যাপ্ত অনুমতি নেই',
    unauthorized: 'প্রমাণীকরণ প্রয়োজন। একটি বৈধ টোকেন প্রদান করুন',
    not_found: 'অনুরোধ করা সংস্থানটি খুঁজে পাওয়া যায়নি',
    rate_limit_exceeded: 'অতিরিক্ত অনুরোধ করা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন',
    token_budget_exceeded: 'দৈনিক এআই কোচিং টোকেন বাজেট অতিক্রম করেছে',
    ai_kill_switch_active: 'জরুরী কিল সুইচের কারণে এআই কোচিং সাময়িকভাবে বন্ধ আছে',
    invalid_credentials: 'আপনার প্রদত্ত ইমেল বা পাসওয়ার্ড সঠিক নয়',
    email_already_registered: 'এই ইমেল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট বিদ্যমান',
    validation_failed: 'অনুরোধ যাচাইকরণ ব্যর্থ হয়েছে',
    institutional_domain_mismatch: 'ইমেলটি অনুমোদিত ইউকে বিশ্ববিদ্যালয়ের ডোমেইনের সাথে মেলেনি (@*.ac.uk)',
    institutional_seats_exhausted: 'এই প্রতিষ্ঠানের জন্য বরাদ্দকৃত সমস্ত আসন পূর্ণ হয়ে গেছে',
    ramadan_suhoor_reminder: 'সেহরি হাইড্রেশন উইন্ডো সক্রিয়: ফজরের আগে দৈনিক লক্ষ্যের ৩০% পানীয় গ্রহণ করুন।',
    ramadan_iftar_reminder: 'ইফতার হাইড্রেশন উইন্ডো সক্রিয়: সূর্যাস্তের পর দৈনিক লক্ষ্যের ৭০% পানীয় গ্রহণ করুন।',
    luteal_deload_notice: 'লুটিয়াল ফেজ সনাক্ত হয়েছে। প্রশিক্ষণের ভলিউম ২৫% কমানো হয়েছে।',
    safety_hold_notice: 'মেডিকেল সেফটি হোল্ড সক্রিয় করা হয়েছে। ভারী ব্যায়াম সাময়িকভাবে স্থগিত।',
  },
  hi: {
    forbidden_underage: 'SMACKGYM का उपयोग करने के लिए आपकी आयु 18 वर्ष या उससे अधिक होनी चाहिए',
    ssrf_target_blocked: 'निजी, लूपबैक या मेटाडेटा पते तक पहुंच पूरी तरह से प्रतिबंधित है',
    insufficient_permissions: 'इस संसाधन तक पहुँचने के लिए आपके पास पर्याप्त अनुमति नहीं है',
    unauthorized: 'प्रमाणीकरण आवश्यक है। कृपया एक वैध टोकन प्रदान करें',
    not_found: 'अनुरोधित संसाधन नहीं मिला',
    rate_limit_exceeded: 'बहुत सारे अनुरोध। कृपया थोड़ी देर बाद पुन: प्रयास करें',
    token_budget_exceeded: 'दैनिक एआई कोचिंग टोकन बजट सीमा पार हो गई है',
    ai_kill_switch_active: 'आपातकालीन किल स्विच द्वारा एआई कोचिंग अस्थायी रूप से अक्षम है',
    invalid_credentials: 'दर्ज किया गया ईमेल या पासवर्ड गलत है',
    email_already_registered: 'इस ईमेल के साथ एक खाता पहले से मौजूद है',
    validation_failed: 'अनुरोध सत्यापन विफल रहा',
    institutional_domain_mismatch: 'ईमेल किसी भी मान्यता प्राप्त यूके विश्वविद्यालय डोमेन (@*.ac.uk) से मेल नहीं खाता',
    institutional_seats_exhausted: 'इस संस्थान के लिए आवंटित सभी सीटें समाप्त हो चुकी हैं',
    ramadan_suhoor_reminder: 'सुहूर हाइड्रेशन विंडो सक्रिय: फज्र से पहले दैनिक लक्ष्य का 30% पानी पिएं।',
    ramadan_iftar_reminder: 'इफ्तार हाइड्रेशन विंडो सक्रिय: सूर्यास्त के बाद दैनिक लक्ष्य का 70% पानी पिएं।',
    luteal_deload_notice: 'ल्यूटियल चरण का पता चला। प्रशिक्षण की मात्रा में 25% की कमी की गई।',
    safety_hold_notice: 'चिकित्सा सुरक्षा होल्ड सक्रिय। भारी व्यायामों पर अस्थायी रोक।',
  },
  ur: {
    forbidden_underage: 'SMACKGYM استعمال کرنے کے لیے آپ کی عمر 18 سال یا اس سے زیادہ ہونی چاہیے',
    ssrf_target_blocked: 'نجی، لوپ بیک، یا میٹا ڈیٹا ایڈریس تک رسائی سختی سے ممنوع ہے',
    insufficient_permissions: 'آپ کے پاس اس وسیلے تک رسائی کے لیے مناسب اجازت نہیں ہے',
    unauthorized: 'تصدیق درکار ہے۔ براہ کرم ایک درست ٹوکن فراہم کریں',
    not_found: 'درخواست کردہ وسیلہ نہیں ملا',
    rate_limit_exceeded: 'بہت زیادہ درخواستیں۔ براہ کرم تھوڑی دیر بعد دوبارہ کوشش کریں',
    token_budget_exceeded: 'روزانہ کا اے آئی کوچنگ ٹوکن بجٹ ختم ہو گیا ہے',
    ai_kill_switch_active: 'ہنگامی کل سوئچ کے ذریعے اے آئی کوچنگ عارضی طور پر غیر فعال ہے',
    invalid_credentials: 'درج کردہ ای میل یا پاس ورڈ غلط ہے',
    email_already_registered: 'اس ای میل کے ساتھ پہلے سے ایک اکاؤنٹ موجود ہے',
    validation_failed: 'درخواست کی توثیق ناکام ہوگئی',
    institutional_domain_mismatch: 'ای میل کسی بھی تسلیم شدہ یوکے یونیورسٹی ڈومین (@*.ac.uk) سے مماثل نہیں ہے',
    institutional_seats_exhausted: 'اس ادارے کے لیے مختص تمام نشستیں ختم ہو چکی ہیں',
    ramadan_suhoor_reminder: 'سحری ہائیڈریشن ونڈو فعال: فجر سے پہلے روزانہ کے ہدف کا 30 فیصد پانی پی لیں۔',
    ramadan_iftar_reminder: 'افطار ہائیڈریشن ونڈو فعال: غروب آفتاب کے بعد روزانہ کے ہدف کا 70 فیصد پانی پی لیں۔',
    luteal_deload_notice: 'لوٹیل مرحلہ پایا گیا۔ تربیتی حجم میں 25 فیصد کمی کی گئی۔',
    safety_hold_notice: 'طبی حفاظتی ہولڈ فعال۔ بھاری ورزشوں پر عارضی پابندی۔',
  },
};

export class I18nService {
  /**
   * Normalizes client language code to supported locale
   */
  public resolveLocale(rawHeader?: string): SupportedLocale {
    if (!rawHeader) return 'en';

    const normalized = rawHeader.toLowerCase();
    if (normalized.includes('bn') || normalized.includes('bengali') || normalized.includes('bangla')) {
      return 'bn';
    }
    if (normalized.includes('hi') || normalized.includes('hindi')) {
      return 'hi';
    }
    if (normalized.includes('ur') || normalized.includes('urdu')) {
      return 'ur';
    }
    return 'en';
  }

  /**
   * Translates a message key into localized string
   */
  public translate(key: string, locale: SupportedLocale = 'en'): string {
    const dict = translations[locale] || translations.en;
    return dict[key] || translations.en[key] || key;
  }

  /**
   * Returns all translations for a given locale
   */
  public getTranslationBundle(locale: SupportedLocale): TranslationDictionary {
    return translations[locale] || translations.en;
  }
}

export const i18nService = new I18nService();
