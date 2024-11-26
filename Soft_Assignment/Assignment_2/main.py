def readFromFile(filename):
    try:
        with open(filename,'r') as file:
            content = file.readlines()
        
        num_datasets = int(content[0].strip())            
        units=[]
        costs=[]
        percentage =[]
        dataset = []
        index =1
        for _ in range(num_datasets):
            percentage.extend([float(x) for x in content[index].strip().split(' ')])
            index +=1
            units.extend([float(x) for x in content[index].strip().split(' ')])
            index += 1
            costs.extend([float(x) for x in content[index].strip().split(' ')])
            index += 1
            dataset.append([percentage,units,costs])
            percentage =[]
            units=[]
            costs=[]
        
        return dataset
    except FileNotFoundError:
        return 'File not found'
    except Exception as e:
        return str(e)
    
    
if __name__ == '__main__':
    content = readFromFile('input.txt')
    print(content[0][1])