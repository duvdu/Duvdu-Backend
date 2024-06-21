import { Iuser, MODELS } from '@duvdu-v1/duvdu';
import { model, Schema, Types } from 'mongoose';


export interface Iproject {
    user: Types.ObjectId | Iuser;
    category: Types.ObjectId | Iuser;
    subCategory: { ar: string; en: string };
    tags: { ar: string; en: string }[];
    cover:string;
    attachments:string[];
    name:string;
    description:string;
    tools:{name:string , unitPrice:number}[];
    functions:{name:string , unitPrice:number}[];
    creatives: Types.ObjectId[] | Iuser [];
    location:{lat:number , lng:number};
    address:string;
    searchKeyWords:string[];
    insurance: number;
    showOnHome: boolean;
    projectScale: { unit: string; minimum: number; maximum: number; pricerPerUnit: number };
    isDeleted: boolean;
    rate: { ratersCounter: number; totalRates: number };
}

export const Project = model<Iproject>('projects' , new Schema<Iproject>({
  user:{type:Schema.Types.ObjectId , ref:MODELS.user},
  category:{type:Schema.Types.ObjectId , ref:MODELS.category},
  subCategory:{ar:{type:String , default:null} , en:{type:String , default:null}},
  tags:[{ar:{type:String , default:null} , en:{type:String , default:null}}],
  cover:{type:String , default:null},
  attachments:[{type:String , default:null}],
  name:{type:String , default:null},
  description:{type:String , default:null},
  tools:[{name:{type:String , default:null} , unitPrice:{type:Number , default:0}}],
  functions:[{name:{type:String , default:null} , unitPrice:{type:Number , default:0}}],
  creatives:[{type:Schema.Types.ObjectId , ref:MODELS.user}],
  location:{lat:{type:Number , default:0} , lng:{type:Number , default:0}},
  address:{type:String , default:null},
  searchKeyWords:[String],
  insurance:{type:Number , default:0},
  showOnHome:{type:Boolean , default:true},
  projectScale: { unit: String, minimum: Number, maximum: Number, pricerPerUnit: Number },
  isDeleted:{type:Boolean , default:false},
  rate: { ratersCounter: Number, totalRates: Number },
},{timestamps:true , collection:'projects'}));