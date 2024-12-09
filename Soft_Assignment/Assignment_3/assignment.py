def add_variables(variables_name):
    name, IN_OUT, range_str = variables_name.split(' ', 2)
    range_list = list(map(int, range_str.strip('[]').split(',')))
    
    return name, IN_OUT, range_list

def add_set(set_name):
    parts = set_name.split(' ', 2)
    name = parts[0]
    TRI_TRAP = parts[1]
    range_list = list(map(int, parts[2].split()))
    if TRI_TRAP == 'TRI':
        if len(range_list) != 3:
            raise ValueError('TRI set function must have 3 values')
    elif TRI_TRAP == 'TRAP':
        if len(range_list) != 4:
            raise ValueError('TRAP set function must have 4 values')
    
    return name, TRI_TRAP, range_list

def add_rule(rule):
    # Split the rule into antecedents and consequents
    antecedents_str, consequents_str = rule.split('=>')
    antecedents_str = antecedents_str.strip()
    consequents_str = consequents_str.strip()
    
    # Parse the antecedents
    if 'and' in antecedents_str:
        conditions = antecedents_str.split('and')
        antecedents = {'and': []}
        for condition in conditions:
            condition = condition.strip()
            if 'not' in condition:
                var = var.strip()
                set_name = set_name.strip()
                antecedents['and'].append({'not': {var: set_name}})
            else:
                var, set_name = condition.split()
                antecedents['and'].append({var: set_name})
    elif 'or' in antecedents_str:
        conditions = antecedents_str.split('or')
        antecedents = {'or': []}
        for condition in conditions:
            condition = condition.strip()
            if 'not' in condition:
                var = var.strip()
                set_name = set_name.strip()
                antecedents['or'].append({'not': {var: set_name}})
            else:
                var, set_name = condition.split()
                antecedents['or'].append({var: set_name})
    else:
        antecedents = {}
        var, set_name = antecedents_str.split()
        if 'not' in antecedents_str:
            var = var.strip()
            set_name = set_name.strip()
            antecedents['not'] = {var: set_name}
        else:
            antecedents[var] = set_name
    
    # Parse the consequents
    consequents = {}
    if 'not' in consequents_str:
        var, set_name = consequents_str.split('not')
        var = var.strip()
        set_name = set_name.strip()
        consequents['not'] = {var: set_name}
    else:
        var, set_name = consequents_str.split()
        consequents[var] = set_name
    
    return {'if': antecedents, 'then': consequents}



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

def fuzzy_inference(fuzzy_values , rules):    
    inferred_values = {}
    
    for rule in rules:
        # Get the if_part and then_part
        if_part = rule['if']
        then_part = rule['then']
        
        # Calculate the degree of truth for the if_part
        if 'and' in if_part:
            truth_values = []
            for condition in if_part['and']:
                if 'not' in condition:
                    var, set_name = list(condition['not'].items())[0]
                    truth_values.append(1 - fuzzy_values[var][set_name])
                else:
                    var, set_name = list(condition.items())[0]
                    truth_values.append(fuzzy_values[var][set_name])
            rule_truth_value = min(truth_values)
        elif 'or' in if_part:
            truth_values = []
            for condition in if_part['or']:
                if 'not' in condition:
                    var, set_name = list(condition['not'].items())[0]
                    truth_values.append(1 - fuzzy_values[var][set_name])
                else:
                    var, set_name = list(condition.items())[0]
                    truth_values.append(fuzzy_values[var][set_name])
            rule_truth_value = max(truth_values)
        elif 'not' in if_part:
            var, set_name = list(if_part['not'].items())[0]
            rule_truth_value = 1 - fuzzy_values[var][set_name]
        
        # Apply the rule's truth value to the then_part
        for var, set_name in then_part.items():
            if var not in inferred_values:
                inferred_values[var] = {}
            if set_name not in inferred_values[var]:
                inferred_values[var][set_name] = 0
            inferred_values[var][set_name] = max(inferred_values[var][set_name], rule_truth_value)
    
    return inferred_values

def defuzzification(variables_map,inferred_values,output_variable):
    numerator = 0
    denominator = 0
    
    for set_name, membership_value in inferred_values[output_variable].items():
        # Get the range of the fuzzy set
        set_details = variables_map[output_variable]['sets'][set_name]
        if set_details['type'] == 'TRI':
            a, b, c = set_details['range']
            # Calculate the centroid of the triangular fuzzy set
            centroid = (a + b + c) / 3
        elif set_details['type'] == 'TRAP':
            a, b, c, d = set_details['range']
            # Calculate the centroid of the trapezoidal fuzzy set
            centroid = (a + b + c + d) / 4
        
        # Calculate the weighted average
        numerator += centroid * membership_value
        denominator += membership_value
    
    if denominator == 0:
        return 0  # To avoid division by zero
    
    crisp_value = numerator / denominator
    return crisp_value


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
                            name, TRI_TRAP,_list = add_set(in_)
                            variables_map[variable_name]['sets'][name] = {'type': TRI_TRAP, 'range': _list}
            if choice == 3:
                print("Enter the rules in this format: (Press x to finish)\n IN_variable set operator IN_variable set => OUT_variable set ")
                in_ = ""
                while in_ != "x":
                    in_ = input()
                    if in_ != "x":
                        rules.append(add_rule(in_))
            if choice == 4:
                print("Enter the crisp values:")
                for key in variables_map:
                    if variables_map[key]['type'] == 'IN':
                        print(f"{key}:")
                        in_ = input()
                        variables_map[key]['crisp'] = int(in_)
                print("Running the simulation...")
                print("Fuzzification => done")
                fuzzy_values = fuzzification(variables_map)
                print("Inference => done")
                inferred_values = fuzzy_inference(fuzzy_values, rules)
                print("Defuzzification => done")
                for var in variables_map:
                    if variables_map[var]['type'] == 'OUT':
                        print(f"The predicted {var} is {max(inferred_values[var])} {defuzzification(variables_map,inferred_values,var)}")
  
    