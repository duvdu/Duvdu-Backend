import { ProjectCycle, NotFound } from '@duvdu-v1/duvdu';

interface IdsWithUnits {
  tools?: Array<{ id: string; units: number }>;
  functions?: Array<{ id: string; units: number }>;
}

interface Result {
  tools: Array<{
    _id: string;
    name: string;
    unitPrice: number;
    units: number;
  }>;
  functions: Array<{
    _id: string;
    name: string;
    unitPrice: number;
    units: number;
  }>;
  totalPrice: number;
}

export async function calculateTotalPrice(
  project: string,
  idsWithUnits: IdsWithUnits = {},
  lang: string,
): Promise<Result> {
  const doc = await ProjectCycle.findById(project);

  if (!doc) throw new NotFound({ en: 'project not found', ar: 'المشروع غير موجود' }, lang);

  let totalPrice = 0;
  const result: Result = {
    tools: [],
    functions: [],
    totalPrice: 0,
  };

  if (idsWithUnits.tools) {
    for (const tool of idsWithUnits.tools) {
      const toolItem = (doc.tools as any).id(tool.id);
      if (!toolItem)
        throw new NotFound(
          {
            en: `Tool with ID ${tool.id} not found`,
            ar: `الأداة برقم التعريف ${tool.id} غير موجودة`,
          },
          lang,
        );

      const itemTotalPrice = toolItem.unitPrice * tool.units;
      totalPrice += itemTotalPrice;
      result.tools.push({
        _id: tool.id,
        name: toolItem.name,
        unitPrice: toolItem.unitPrice,
        units: tool.units,
      });
    }
  }

  if (idsWithUnits.functions) {
    for (const func of idsWithUnits.functions) {
      const functionItem = (doc.functions as any).id(func.id);
      if (!functionItem)
        throw new NotFound(
          {
            en: `Function with ID ${func.id} not found`,
            ar: `الدالة برقم التعريف ${func.id} غير موجودة`,
          },
          lang,
        );

      const itemTotalPrice = functionItem.unitPrice * func.units;
      totalPrice += itemTotalPrice;
      result.functions.push({
        _id: func.id,
        name: functionItem.name,
        unitPrice: functionItem.unitPrice,
        units: func.units,
      });
    }
  }

  result.totalPrice = totalPrice;
  return result;
}
