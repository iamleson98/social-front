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
