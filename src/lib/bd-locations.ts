// Divisions and districts of Bangladesh. District codes are what delivery zones match on.
export type District = { code: string; bn: string };
export type Division = { code: string; bn: string; districts: District[] };

export const DIVISIONS: Division[] = [
  { code: 'dhaka', bn: 'ঢাকা', districts: [
    { code: 'dhaka', bn: 'ঢাকা' }, { code: 'gazipur', bn: 'গাজীপুর' }, { code: 'narayanganj', bn: 'নারায়ণগঞ্জ' },
    { code: 'narsingdi', bn: 'নরসিংদী' }, { code: 'manikganj', bn: 'মানিকগঞ্জ' }, { code: 'munshiganj', bn: 'মুন্সীগঞ্জ' },
    { code: 'tangail', bn: 'টাঙ্গাইল' }, { code: 'kishoreganj', bn: 'কিশোরগঞ্জ' }, { code: 'faridpur', bn: 'ফরিদপুর' },
    { code: 'gopalganj', bn: 'গোপালগঞ্জ' }, { code: 'madaripur', bn: 'মাদারীপুর' }, { code: 'rajbari', bn: 'রাজবাড়ী' },
    { code: 'shariatpur', bn: 'শরীয়তপুর' } ] },
  { code: 'chattogram', bn: 'চট্টগ্রাম', districts: [
    { code: 'chattogram', bn: 'চট্টগ্রাম' }, { code: 'coxsbazar', bn: 'কক্সবাজার' }, { code: 'cumilla', bn: 'কুমিল্লা' },
    { code: 'brahmanbaria', bn: 'ব্রাহ্মণবাড়িয়া' }, { code: 'chandpur', bn: 'চাঁদপুর' }, { code: 'feni', bn: 'ফেনী' },
    { code: 'lakshmipur', bn: 'লক্ষ্মীপুর' }, { code: 'noakhali', bn: 'নোয়াখালী' }, { code: 'khagrachhari', bn: 'খাগড়াছড়ি' },
    { code: 'rangamati', bn: 'রাঙ্গামাটি' }, { code: 'bandarban', bn: 'বান্দরবান' } ] },
  { code: 'rajshahi', bn: 'রাজশাহী', districts: [
    { code: 'rajshahi', bn: 'রাজশাহী' }, { code: 'bogura', bn: 'বগুড়া' }, { code: 'joypurhat', bn: 'জয়পুরহাট' },
    { code: 'naogaon', bn: 'নওগাঁ' }, { code: 'natore', bn: 'নাটোর' }, { code: 'chapainawabganj', bn: 'চাঁপাইনবাবগঞ্জ' },
    { code: 'pabna', bn: 'পাবনা' }, { code: 'sirajganj', bn: 'সিরাজগঞ্জ' } ] },
  { code: 'khulna', bn: 'খুলনা', districts: [
    { code: 'khulna', bn: 'খুলনা' }, { code: 'bagerhat', bn: 'বাগেরহাট' }, { code: 'satkhira', bn: 'সাতক্ষীরা' },
    { code: 'jashore', bn: 'যশোর' }, { code: 'jhenaidah', bn: 'ঝিনাইদহ' }, { code: 'magura', bn: 'মাগুরা' },
    { code: 'narail', bn: 'নড়াইল' }, { code: 'kushtia', bn: 'কুষ্টিয়া' }, { code: 'chuadanga', bn: 'চুয়াডাঙ্গা' },
    { code: 'meherpur', bn: 'মেহেরপুর' } ] },
  { code: 'barishal', bn: 'বরিশাল', districts: [
    { code: 'barishal', bn: 'বরিশাল' }, { code: 'bhola', bn: 'ভোলা' }, { code: 'patuakhali', bn: 'পটুয়াখালী' },
    { code: 'pirojpur', bn: 'পিরোজপুর' }, { code: 'jhalokati', bn: 'ঝালকাঠি' }, { code: 'barguna', bn: 'বরগুনা' } ] },
  { code: 'sylhet', bn: 'সিলেট', districts: [
    { code: 'sylhet', bn: 'সিলেট' }, { code: 'moulvibazar', bn: 'মৌলভীবাজার' }, { code: 'habiganj', bn: 'হবিগঞ্জ' },
    { code: 'sunamganj', bn: 'সুনামগঞ্জ' } ] },
  { code: 'rangpur', bn: 'রংপুর', districts: [
    { code: 'rangpur', bn: 'রংপুর' }, { code: 'dinajpur', bn: 'দিনাজপুর' }, { code: 'thakurgaon', bn: 'ঠাকুরগাঁও' },
    { code: 'panchagarh', bn: 'পঞ্চগড়' }, { code: 'nilphamari', bn: 'নীলফামারী' }, { code: 'lalmonirhat', bn: 'লালমনিরহাট' },
    { code: 'kurigram', bn: 'কুড়িগ্রাম' }, { code: 'gaibandha', bn: 'গাইবান্ধা' } ] },
  { code: 'mymensingh', bn: 'ময়মনসিংহ', districts: [
    { code: 'mymensingh', bn: 'ময়মনসিংহ' }, { code: 'jamalpur', bn: 'জামালপুর' }, { code: 'sherpur', bn: 'শেরপুর' },
    { code: 'netrokona', bn: 'নেত্রকোণা' } ] },
];

/** Upazila suggestions (free text is still allowed). Extend as needed. */
export const UPAZILA_SUGGESTIONS: Record<string, string[]> = {
  bogura: ['বগুড়া সদর', 'শাজাহানপুর', 'শেরপুর', 'ধুনট', 'গাবতলী', 'সারিয়াকান্দি', 'সোনাতলা', 'শিবগঞ্জ', 'কাহালু', 'নন্দীগ্রাম', 'দুপচাঁচিয়া', 'আদমদীঘি'],
};

export function findLocation(divisionCode: string, districtCode: string) {
  const division = DIVISIONS.find((d) => d.code === divisionCode);
  const district = division?.districts.find((d) => d.code === districtCode);
  return division && district ? { division, district } : null;
}
