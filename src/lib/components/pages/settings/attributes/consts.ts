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
