import { DataProxy } from 'apollo-cache';
import { DocumentNode } from 'graphql';

export abstract class BaseService {

  protected readAndWriteQueryInApolloCache<T = any>(
    config: {
      store: DataProxy,
      newRecord: T,
      query: DocumentNode,
      queryName: string,
      arrayOperation: 'push' | 'unshift' | 'sigleRecord',
      variables?: { [key: string]: string }
    }
  ): void {

    try {
      const data = config.store.readQuery({
        query: config.query,
        variables: config.variables
      });

      switch (config.arrayOperation) {
        case 'push':
        case 'unshift':
          data[config.queryName] = [...data[config.queryName]];
          data[config.queryName][config.arrayOperation](config.newRecord);
          break;
        case 'sigleRecord':
            data[config.queryName] = [config.newRecord];
      }

      config.store.writeQuery({
        query: config.query,
        variables: config.variables,
        data
      });

    } catch (error) {
      console.log('Error: ', error);
    }


  }

}
