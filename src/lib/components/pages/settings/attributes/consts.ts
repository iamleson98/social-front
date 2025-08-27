import { MeasurementUnitsEnum } from "$lib/gql/graphql";

export enum MetricSystem {
  Metric = "Metric",
  Imperial = "Imperial",
};

export enum MetricUnit {
  Weight = "Weight",
  Volume = "Volume",
  Distance = "Distance",
  Area = "Area",
};

export const HumanizeUnit: Record<MeasurementUnitsEnum, string> = {
  [MeasurementUnitsEnum.AcreFt]: "acre-ft",
  [MeasurementUnitsEnum.AcreIn]: "acre-in",
  [MeasurementUnitsEnum.Cm]: "cm",
  [MeasurementUnitsEnum.CubicCentimeter]: "cm³",
  [MeasurementUnitsEnum.CubicDecimeter]: "dm³",
  [MeasurementUnitsEnum.CubicFoot]: "ft³",
  [MeasurementUnitsEnum.CubicInch]: "in³",
  [MeasurementUnitsEnum.CubicMeter]: "m³",
  [MeasurementUnitsEnum.CubicMillimeter]: "mm³",
  [MeasurementUnitsEnum.CubicYard]: "yd³",
  [MeasurementUnitsEnum.Dm]: "dm",
  [MeasurementUnitsEnum.FlOz]: "fl oz",
  [MeasurementUnitsEnum.Ft]: "ft",
  [MeasurementUnitsEnum.G]: "g",
  [MeasurementUnitsEnum.Inch]: "in",
  [MeasurementUnitsEnum.Kg]: "kg",
  [MeasurementUnitsEnum.Km]: "km",
  [MeasurementUnitsEnum.Lb]: "lb",
  [MeasurementUnitsEnum.Liter]: "L",
  [MeasurementUnitsEnum.M]: "m",
  [MeasurementUnitsEnum.Mm]: "mm",
  [MeasurementUnitsEnum.Oz]: "oz",
  [MeasurementUnitsEnum.Pint]: "pt",
  [MeasurementUnitsEnum.Qt]: "qt",
  [MeasurementUnitsEnum.SqCm]: "cm²",
  [MeasurementUnitsEnum.SqDm]: "dm²",
  [MeasurementUnitsEnum.SqFt]: "ft²",
  [MeasurementUnitsEnum.SqInch]: "in²",
  [MeasurementUnitsEnum.SqKm]: "km²",
  [MeasurementUnitsEnum.SqM]: "m²",
  [MeasurementUnitsEnum.SqMm]: "mm²",
  [MeasurementUnitsEnum.SqYd]: "yd²",
  [MeasurementUnitsEnum.Tonne]: "t",
  [MeasurementUnitsEnum.Yd]: "yd"
};


export const MetricClassification: Record<MetricSystem, Record<MetricUnit, MeasurementUnitsEnum[]>> = {
  [MetricSystem.Metric]: {
    [MetricUnit.Weight]: [MeasurementUnitsEnum.G, MeasurementUnitsEnum.Kg, MeasurementUnitsEnum.Tonne],
    [MetricUnit.Volume]: [
      MeasurementUnitsEnum.Liter,
      MeasurementUnitsEnum.CubicMillimeter,
      MeasurementUnitsEnum.CubicCentimeter,
      MeasurementUnitsEnum.CubicDecimeter,
      MeasurementUnitsEnum.CubicMeter
    ],
    [MetricUnit.Distance]: [
      MeasurementUnitsEnum.Mm,
      MeasurementUnitsEnum.Cm,
      MeasurementUnitsEnum.Dm,
      MeasurementUnitsEnum.M,
      MeasurementUnitsEnum.Km
    ],
    [MetricUnit.Area]: [
      MeasurementUnitsEnum.SqMm,
      MeasurementUnitsEnum.SqCm,
      MeasurementUnitsEnum.SqDm,
      MeasurementUnitsEnum.SqM,
      MeasurementUnitsEnum.SqKm
    ]
  },
  [MetricSystem.Imperial]: {
    [MetricUnit.Weight]: [MeasurementUnitsEnum.Lb, MeasurementUnitsEnum.Oz],
    [MetricUnit.Volume]: [
      MeasurementUnitsEnum.FlOz,
      MeasurementUnitsEnum.Pint,
      MeasurementUnitsEnum.Qt,
      MeasurementUnitsEnum.CubicInch,
      MeasurementUnitsEnum.CubicFoot,
      MeasurementUnitsEnum.CubicYard,
      MeasurementUnitsEnum.AcreFt,
      MeasurementUnitsEnum.AcreIn
    ],
    [MetricUnit.Distance]: [
      MeasurementUnitsEnum.Inch,
      MeasurementUnitsEnum.Ft,
      MeasurementUnitsEnum.Yd
    ],
    [MetricUnit.Area]: [
      MeasurementUnitsEnum.SqInch,
      MeasurementUnitsEnum.SqFt,
      MeasurementUnitsEnum.SqYd
    ]
  }
};

type MetricInfo = [MetricUnit, MetricSystem];

const unitMetricMap: Record<MeasurementUnitsEnum, MetricInfo> = {
  // Imperial Area
  [MeasurementUnitsEnum.SqInch]: [MetricUnit.Area, MetricSystem.Imperial],
  [MeasurementUnitsEnum.SqFt]: [MetricUnit.Area, MetricSystem.Imperial],
  [MeasurementUnitsEnum.SqYd]: [MetricUnit.Area, MetricSystem.Imperial],

  // Imperial Distance
  [MeasurementUnitsEnum.Inch]: [MetricUnit.Distance, MetricSystem.Imperial],
  [MeasurementUnitsEnum.Ft]: [MetricUnit.Distance, MetricSystem.Imperial],
  [MeasurementUnitsEnum.Yd]: [MetricUnit.Distance, MetricSystem.Imperial],

  // Imperial Volume
  [MeasurementUnitsEnum.FlOz]: [MetricUnit.Volume, MetricSystem.Imperial],
  [MeasurementUnitsEnum.Pint]: [MetricUnit.Volume, MetricSystem.Imperial],
  [MeasurementUnitsEnum.Qt]: [MetricUnit.Volume, MetricSystem.Imperial],
  [MeasurementUnitsEnum.CubicInch]: [MetricUnit.Volume, MetricSystem.Imperial],
  [MeasurementUnitsEnum.CubicFoot]: [MetricUnit.Volume, MetricSystem.Imperial],
  [MeasurementUnitsEnum.CubicYard]: [MetricUnit.Volume, MetricSystem.Imperial],
  [MeasurementUnitsEnum.AcreFt]: [MetricUnit.Volume, MetricSystem.Imperial],
  [MeasurementUnitsEnum.AcreIn]: [MetricUnit.Volume, MetricSystem.Imperial],

  // Imperial Weight
  [MeasurementUnitsEnum.Lb]: [MetricUnit.Weight, MetricSystem.Imperial],
  [MeasurementUnitsEnum.Oz]: [MetricUnit.Weight, MetricSystem.Imperial],

  // Metric Area
  [MeasurementUnitsEnum.SqMm]: [MetricUnit.Area, MetricSystem.Metric],
  [MeasurementUnitsEnum.SqCm]: [MetricUnit.Area, MetricSystem.Metric],
  [MeasurementUnitsEnum.SqDm]: [MetricUnit.Area, MetricSystem.Metric],
  [MeasurementUnitsEnum.SqM]: [MetricUnit.Area, MetricSystem.Metric],
  [MeasurementUnitsEnum.SqKm]: [MetricUnit.Area, MetricSystem.Metric],

  // Metric Distance
  [MeasurementUnitsEnum.Mm]: [MetricUnit.Distance, MetricSystem.Metric],
  [MeasurementUnitsEnum.Cm]: [MetricUnit.Distance, MetricSystem.Metric],
  [MeasurementUnitsEnum.Dm]: [MetricUnit.Distance, MetricSystem.Metric],
  [MeasurementUnitsEnum.M]: [MetricUnit.Distance, MetricSystem.Metric],
  [MeasurementUnitsEnum.Km]: [MetricUnit.Distance, MetricSystem.Metric],

  // Metric Volume
  [MeasurementUnitsEnum.Liter]: [MetricUnit.Volume, MetricSystem.Metric],
  [MeasurementUnitsEnum.CubicMillimeter]: [MetricUnit.Volume, MetricSystem.Metric],
  [MeasurementUnitsEnum.CubicCentimeter]: [MetricUnit.Volume, MetricSystem.Metric],
  [MeasurementUnitsEnum.CubicDecimeter]: [MetricUnit.Volume, MetricSystem.Metric],
  [MeasurementUnitsEnum.CubicMeter]: [MetricUnit.Volume, MetricSystem.Metric],

  // Metric Weight
  [MeasurementUnitsEnum.G]: [MetricUnit.Weight, MetricSystem.Metric],
  [MeasurementUnitsEnum.Kg]: [MetricUnit.Weight, MetricSystem.Metric],
  [MeasurementUnitsEnum.Tonne]: [MetricUnit.Weight, MetricSystem.Metric],
};

export const inferMetricSystemAndUnitsOfFromUnit = (
  unit: MeasurementUnitsEnum
): MetricInfo | undefined => {
  return unitMetricMap[unit];
};
