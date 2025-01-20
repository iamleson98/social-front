import type { SelectItemProps } from '$lib/components/ui/levelSelector/types';
import vietnam from './vietnam.json';

type AdministrationUnitType = 'province' | 'district' | 'ward';

export type AdministrativeUnit = SelectItemProps & {
  type: AdministrationUnitType;
}

const VIETNAM_COUNTRY_UNITS: AdministrativeUnit[] = [];

for (const province of Object.keys(vietnam)) {
  const lowerLevelData = vietnam[province as keyof typeof vietnam];
  const provinceData: AdministrativeUnit = {
    title: province,
    value: province,
    type: 'province',
    children: [],
  };
  VIETNAM_COUNTRY_UNITS.push(provinceData);

  for (const district of Object.keys(lowerLevelData)) {
    const districtData: AdministrativeUnit = {
      type: 'district',
      title: district,
      value: district,
      children: [],
    };

    const wards: string[] = lowerLevelData[district as keyof typeof lowerLevelData];
    for (const ward of wards) {
      const wardData: AdministrativeUnit = {
        type: 'ward',
        title: ward,
        value: ward,
      };

      districtData.children?.push(wardData);
    }

    provinceData.children?.push(districtData);
  }
}

export { VIETNAM_COUNTRY_UNITS };
