def add_variables(variables_name):
    name, IN_OUT, range_str = variables_name.split(' ', 2)
    range_list = list(map(int, range_str.strip('[]').split(',')))
    
    return name, IN_OUT, range_list

def add_membership(membership_name):
    parts = membership_name.split(' ', 2)
    name = parts[0]
    TRI_TRAP = parts[1]
    range_list = list(map(int, parts[2].split()))
    if TRI_TRAP == 'TRI':
        if len(range_list) != 3:
            raise ValueError('TRI membership function must have 3 values')
    elif TRI_TRAP == 'TRAP':
        if len(range_list) != 4:
            raise ValueError('TRAP membership function must have 4 values')
    
    return name, TRI_TRAP, range_list

def fuzzification(variable_map):
    fuzzy_values = {}
    
    for var_name, var_details in variable_map.items():
        crisp_value = var_details['crisp']
        fuzzy_values[var_name] = {}
        
        for set_name, set_details in var_details['sets'].items():
            if set_details['type'] == 'TRI':
                a, b, c = set_details['range']
                if a <= crisp_value <= b:
                    membership_value = (crisp_value - a) / (b - a)
                elif b <= crisp_value <= c:
                    membership_value = (c - crisp_value) / (c - b)
                else:
                    membership_value = 0
            elif set_details['type'] == 'TRAP':
                a, b, c, d = set_details['range']
                if a <= crisp_value <= b:
                    membership_value = (crisp_value - a) / (b - a)
                elif b <= crisp_value <= c:
                    membership_value = 1
                elif c <= crisp_value <= d:
                    membership_value = (d - crisp_value) / (d - c)
                else:
                    membership_value = 0
            
            fuzzy_values[var_name][set_name] = membership_value
    
    return fuzzy_values

if __name__ == '__main__':
    choice = 0
    derscription = ""
    in_ =""
    variables_map = {}
    rules = []
    crisp_values={}
    print("Fuzzy Logic Toolbox")
    print("====================================")
    print("1- Create a new Fuzzy System")
    print("2- Quit")
    choice = int(input("Enter your choice: "))
    
    if choice == 1:
        derscription = input("Enter the system's name and brief description: \n")
        while choice != 0:
            print("Main Menu")
            print("====================================")
            print("1- Add variables")
            print("2- Add fuzzy sets to an existing variable")
            print("3- Add rules")
            print("4- Run the simulation on crisp values")
            choice = int(input("Enter your choice: "))
            if choice == 1:
                print("Enter the variable’s name, type (IN/OUT) and range ([lower, upper]): (Press x to finish)")
                while in_ != "x":
                    in_ = input()
                    if in_ != "x":
                        name ,IN_OUT,range =add_variables(in_)
                        variables_map[name] = {'type':IN_OUT,'range': range, 'sets': {},'crisp':0}
            if choice == 2:
                print("Enter the variable’s name:")
                in_ = input()
                variable_name = in_
                if in_ in variables_map:
                    print("Enter the fuzzy set name, type (TRI/TRAP) and values: (Press x to finish)")
                    in_ = ""
                    while in_ != "x":
                        in_ = input()
                        if in_ != "x":
                            name, TRI_TRAP,_list = add_membership(in_)
                            variables_map[variable_name]['sets'][name] = {'type': TRI_TRAP, 'range': _list}
            if choice == 3:
                print("Enter the rules in this format: (Press x to finish)\n IN_variable set operator IN_variable set => OUT_variable set ")
                in_ = ""
                while in_ != "x":
                    in_ = input()
                    if in_ != "x":
                        rules.append(in_)
            if choice == 4:
                print("Enter the crisp values:")
                for key in variables_map:
                    print(f"{key}:")
                    in_ = input()
                    crisp_values[key]['crisp'] = int(in_) 




    