export interface StateRegionInfo {
  id: string;
  name: string;
  region: string;
  universities: string[];
}

export const NIGERIA_CAMPUS_REGIONS: StateRegionInfo[] = [
  {
    id: 'Bayelsa',
    name: 'Bayelsa State',
    region: 'South-South',
    universities: [
      'Niger Delta University (NDU, Amassoma & Wilberforce Island)',
      'Bayelsa Medical University (BMU, Yenagoa)',
      'Federal University Otuoke (FUOTUOKE)',
      'Bayelsa State Polytechnic (BYSPOLY, Aleibiri)',
      'Federal Polytechnic, Ekowe',
      'University of Africa, Toru-Orua (UAT)',
      'Bayelsa State College of Health Technology (BYCOHTECH, Otuogidi)',
      'International Institute of Tourism and Hospitality (IITH, Yenagoa)'
    ]
  },
  {
    id: 'Abia',
    name: 'Abia State',
    region: 'South-East',
    universities: [
      'Abia State University (ABSU, Uturu)',
      'Michael Okpara University of Agriculture (MOUAU, Umudike)',
      'Abia State Polytechnic (Aba)',
      'Rhema University (Aba)',
      'Gregory University (Uturu)'
    ]
  },
  {
    id: 'Rivers',
    name: 'Rivers State',
    region: 'South-South',
    universities: [
      'University of Port Harcourt (UNIPORT, Choba)',
      'Rivers State University (RSU, Port Harcourt)',
      'Ignatius Ajuru University of Education (IAUE, Rumuolumeni)',
      'Captain Elechi Amadi Polytechnic (Rumuola, Port Harcourt)',
      'Ken Saro-Wiwa Polytechnic (Bori)',
      'PAMO University of Medical Sciences (Port Harcourt)'
    ]
  },
  {
    id: 'Delta',
    name: 'Delta State',
    region: 'South-South',
    universities: [
      'Delta State University (DELSU, Abraka)',
      'Federal University of Petroleum Resources (FUPRE, Effurun)',
      'Dennis Osadebay University (DOU, Asaba)',
      'University of Delta (UNIDEL, Agbor)',
      'Delta State Polytechnic (Ogwashi-Uku)',
      'Delta State Polytechnic (Otefe-Oghara)',
      'Delta State College of Health Technology (Ofuoma-Ughelli)'
    ]
  },
  {
    id: 'Lagos',
    name: 'Lagos State',
    region: 'South-West',
    universities: [
      'University of Lagos (UNILAG, Akoka)',
      'Lagos State University (LASU, Ojo)',
      'Yaba College of Technology (YABATECH)',
      'Lagos State University of Science and Technology (LASUSTECH, Ikorodu)',
      'Lagos State University of Education (LASUED, Ijanikin)',
      'Pan-Atlantic University (PAU, Ibeju-Lekki)'
    ]
  },
  {
    id: 'Edo',
    name: 'Edo State',
    region: 'South-South',
    universities: [
      'University of Benin (UNIBEN, Ugbowo & Ekenwan)',
      'Ambrose Alli University (AAU, Ekpoma)',
      'Edo State University (Uzairue)',
      'Auchi Polytechnic (Auchi)',
      'Igbinedion University (IUO, Okada)'
    ]
  },
  {
    id: 'Oyo',
    name: 'Oyo State',
    region: 'South-West',
    universities: [
      'University of Ibadan (UI, Ibadan)',
      'Ladoke Akintola University of Technology (LAUTECH, Ogbomoso)',
      'The Polytechnic, Ibadan',
      'Lead City University (Ibadan)',
      'Ajayi Crowther University (Oyo)'
    ]
  },
  {
    id: 'Abuja',
    name: 'Abuja (FCT)',
    region: 'North-Central',
    universities: [
      'University of Abuja (UNIABUJA, Gwagwalada)',
      'Nile University of Nigeria (Abuja)',
      'Baze University (Abuja)',
      'Veritas University (Abuja)'
    ]
  },
  {
    id: 'Enugu',
    name: 'Enugu State',
    region: 'South-East',
    universities: [
      'University of Nigeria, Nsukka (UNN / UNEC)',
      'Enugu State University of Science and Technology (ESUT)',
      'Institute of Management and Technology (IMT, Enugu)',
      'Godfrey Okoye University (Enugu)'
    ]
  },
  {
    id: 'Imo',
    name: 'Imo State',
    region: 'South-East',
    universities: [
      'Federal University of Technology Owerri (FUTO)',
      'Imo State University (IMSU, Owerri)',
      'Federal Polytechnic, Nekede'
    ]
  },
  {
    id: 'Akwa Ibom',
    name: 'Akwa Ibom State',
    region: 'South-South',
    universities: [
      'University of Uyo (UNIUYO)',
      'Akwa Ibom State University (AKSU, Ikot Akpaden)',
      'Federal Polytechnic, Ukana'
    ]
  },
  {
    id: 'Ogun',
    name: 'Ogun State',
    region: 'South-West',
    universities: [
      'Federal University of Agriculture, Abeokuta (FUNAAB)',
      'Olabisi Onabanjo University (OOU, Ago-Iwoye)',
      'Covenant University (Ota)',
      'Moshood Abiola Polytechnic (MAPOLY, Abeokuta)',
      'Babcock University (Ilishan-Remo)'
    ]
  },
  {
    id: 'Anambra',
    name: 'Anambra State',
    region: 'South-East',
    universities: [
      'Nnamdi Azikiwe University (UNIZIK, Awka)',
      'Chukwuemeka Odumegwu Ojukwu University (COOU, Uli/Igbariam)',
      'Federal Polytechnic, Oko'
    ]
  },
  {
    id: 'Kwara',
    name: 'Kwara State',
    region: 'North-Central',
    universities: [
      'University of Ilorin (UNILORIN)',
      'Kwara State University (KWASU, Malete)',
      'Federal Polytechnic, Offa'
    ]
  }
];

export const ALL_NIGERIAN_STATES = NIGERIA_CAMPUS_REGIONS.map((r) => r.id);

export function getUniversitiesByState(stateId: string): string[] {
  const match = NIGERIA_CAMPUS_REGIONS.find(
    (s) => s.id.toLowerCase() === stateId.toLowerCase() || s.name.toLowerCase().includes(stateId.toLowerCase())
  );
  return match ? match.universities : [];
}

export function getAllUniversitiesList(): string[] {
  const all: string[] = [];
  NIGERIA_CAMPUS_REGIONS.forEach((s) => {
    s.universities.forEach((u) => {
      if (!all.includes(u)) all.push(u);
    });
  });
  return all;
}
