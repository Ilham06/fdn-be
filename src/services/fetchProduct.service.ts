import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class FetchProductService {
  async getProducts() {
    const { data } = await axios.get('https://fakestoreapi.com/products');
    console.log(data)
    return data;
  }
}
