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


def check_not_condition(condition):
    condition = condition.strip()
    if 'not' in condition:
        condition = condition.replace('_not', '').strip()
        var, set_name = condition.split()
        return {'not': {var: set_name}}
    else:
        var, set_name = condition.split()
        return {var: set_name}


def check_nested_condition(condition):
    if ' and' in condition:
        sub_conditions = condition.split('and')
        nested_conditions = []
        for sub_condition in sub_conditions:
            nested_conditions.append(check_nested_condition(sub_condition.strip()))
        return {'and': nested_conditions}
    elif ' or ' in condition:
        sub_conditions = condition.split('or')
        nested_conditions = []
        for sub_condition in sub_conditions:
            nested_conditions.append(check_nested_condition(sub_condition.strip()))
        return {'and': nested_conditions}
    else:
        return check_not_condition(condition.strip())

def add_rule(rule):
    if_part_str, then_part_str = rule.split('=>')
    if_part_str = if_part_str.strip()
    then_part_str = then_part_str.strip()

    if ' or ' in if_part_str:
        conditons = if_part_str.split(' or ')
        if_part = {'or': []}
        for condition in conditons:
            if_part['or'].append(check_nested_condition(condition))
    else:
        conditons = if_part_str.split(' and')
        if_part = {'and': []}
        for condition in conditons:
            if_part['and'].append(check_nested_condition(condition))


    then_part = {}
    var, set_name = then_part_str.split()
    then_part[var] = set_name

    return {'if': if_part, 'then': then_part}

def fuzzification(variable_map):
    fuzzy_values = {}
    
    for var_name, var_details in variable_map.items():
        crisp_value = var_details['crisp']
        fuzzy_values[var_name] = {}
        if var_details['type'] == 'IN':
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
        else:
            for set_name, set_details in var_details['sets'].items():
                fuzzy_values[var_name][set_name] = 0
    
    return fuzzy_values
    

def evaluate_condition(condition, fuzzy_values):
    if 'and' in condition:
        truth_values = []
        for sub_condition in condition['and']:
            truth_value = evaluate_condition(sub_condition, fuzzy_values)
            truth_values.append(truth_value)
        return min(truth_values)
    elif 'or' in condition:
        truth_values = []
        for sub_condition in condition['or']:
            truth_value = evaluate_condition(sub_condition, fuzzy_values)
            truth_values.append(truth_value)
        return max(truth_values)
    elif 'not' in condition:
        sub_condition = condition['not']
        return 1 - evaluate_condition(sub_condition, fuzzy_values) 
    else:
        # Base case: simple condition {variable: set_name}
        var, set_name = list(condition.items())[0]
        return fuzzy_values[var][set_name]


def fuzzy_inference(fuzzy_values, rules):
    inferred_values = {}

    for rule in rules:
        if_part = rule['if']
        then_part = rule['then']
        
        rule_truth_value = evaluate_condition(if_part, fuzzy_values)
        
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
        set_details = variables_map[output_variable]['sets'][set_name]
        if set_details['type'] == 'TRI':
            a, b, c = set_details['range']
            centroid = (a + b + c) / 3
        elif set_details['type'] == 'TRAP':
            a, b, c, d = set_details['range']
            centroid = (a + b + c + d) / 4
        numerator += centroid * membership_value
        denominator += membership_value
    
    if denominator == 0:
        return 0  
    
    crisp_value = numerator / denominator
    return crisp_value


if __name__ == '__main__':
    # choice = 0
    # derscription = ""
    # in_ =""
    # variables_map = {}
    # rules = []
    # crisp_values={}
    # print("Fuzzy Logic Toolbox")
    # print("====================================")
    # print("1- Create a new Fuzzy System")
    # print("2- Quit")
    # choice = int(input("Enter your choice: "))

    # if choice == 1:
    #     derscription = input("Enter the system's name and brief description: \n")
    #     while choice != 0:
    #         print("Main Menu")
    #         print("====================================")
    #         print("1- Add variables")
    #         print("2- Add fuzzy sets to an existing variable")
    #         print("3- Add rules")
    #         print("4- Run the simulation on crisp values")
    #         choice = int(input("Enter your choice: "))
    #         if choice == 1:
    #             print("Enter the variable’s name, type (IN/OUT) and range ([lower, upper]): (Press x to finish)")
    #             while in_ != "x":
    #                 in_ = input()
    #                 if in_ != "x":
    #                     name ,IN_OUT,range =add_variables(in_)
    #                     variables_map[name] = {'type':IN_OUT,'range': range, 'sets': {},'crisp':0}
    #         if choice == 2:
    #             print("Enter the variable’s name:")
    #             in_ = input()
    #             variable_name = in_
    #             if in_ in variables_map:
    #                 print("Enter the fuzzy set name, type (TRI/TRAP) and values: (Press x to finish)")
    #                 in_ = ""
    #                 while in_ != "x":
    #                     in_ = input()
    #                     if in_ != "x":
    #                         name, TRI_TRAP,_list = add_set(in_)
    #                         variables_map[variable_name]['sets'][name] = {'type': TRI_TRAP, 'range': _list}
    #         if choice == 3:
    #             print("Enter the rules in this format: (Press x to finish)\n IN_variable set operator IN_variable set => OUT_variable set ")
    #             in_ = ""
    #             while in_ != "x":
    #                 in_ = input()
    #                 if in_ != "x":
    #                     rules.append(add_rule(in_))
    #         if choice == 4:
    #             print("Enter the crisp values:")
    #             for key in variables_map:
    #                 if variables_map[key]['type'] == 'IN':
    #                     print(f"{key}:")
    #                     in_ = input()
    #                     variables_map[key]['crisp'] = int(in_)
    #             print("Running the simulation...")
    #             print("Fuzzification => done")
    #             fuzzy_values = fuzzification(variables_map)
    #             print("Inference => done")
    #             inferred_values = fuzzy_inference(fuzzy_values, rules)
    #             print("Defuzzification => done")
    #             for var in variables_map:
    #                 if variables_map[var]['type'] == 'OUT':
    #                     print(f"The predicted {var} is {max(inferred_values[var])} {defuzzification(variables_map,inferred_values,var)}")

    # variables_map = {
    # 'proj_funding': {'type': 'IN', 'range': [0, 100],'sets': {
    # 'very_low': {'type': 'TRAP', 'range': [0, 0, 10, 30]},
    # 'low': {'type': 'TRAP', 'range': [10, 30, 40, 60]},
    # 'medium': {'type': 'TRAP', 'range': [40, 60, 70, 90]},
    # 'high': {'type': 'TRAP', 'range': [70, 90, 100, 100]}}, 'crisp': 50},
    # 'exp_level': {'type': 'IN', 'range': [0, 60], 'sets': {
    # 'beginner': {'type': 'TRI', 'range': [0, 15, 30]},
    # 'intermediate': {'type': 'TRI', 'range': [15, 30, 45]},
    # 'expert': {'type': 'TRI', 'range': [30, 60, 60]}
    # }, 'crisp': 40},
    # 'risk': {'type': 'OUT', 'range': [0, 100], 'sets': {
    # 'low': {'type': 'TRI', 'range': [0, 25, 50]},
    # 'normal': {'type': 'TRI', 'range': [25, 50, 75]},
    # 'high': {'type': 'TRI', 'range': [50, 100, 100]}
    # }, 'crisp': 70}
    # }
    
    variables_map = {
    'amount_dirt': {'type': 'IN', 'range': [0, 100],'sets': {
    'small': {'type': 'TRAP', 'range': [0, 0, 20, 40]},
    'medium': {'type': 'TRAP', 'range': [20, 40, 60, 80]},
    'large': {'type': 'TRAP', 'range': [60, 80, 100, 100]}}, 'crisp': 60},
    'fabric': {'type': 'IN', 'range': [0, 100], 'sets': {
    'soft': {'type': 'TRAP', 'range': [0, 0,20, 40]},
    'ordinary': {'type': 'TRAP', 'range': [20, 40,60, 80]},
    'stiff': {'type': 'TRAP', 'range': [60, 80, 100,100]}
    }, 'crisp': 25},
    'wash_time': {'type': 'OUT', 'range': [0, 60], 'sets': {
    'very_small': {'type': 'TRI', 'range': [0, 0, 15]},
    'small': {'type': 'TRI', 'range': [0, 15, 30]},   
    'standard': {'type': 'TRI', 'range': [15, 30, 45]},
    'large': {'type': 'TRI', 'range': [30, 45, 60]},
    'very_large': {'type': 'TRI', 'range': [45, 60, 60]}
    }, 'crisp': 0}
    }
    

    rules = [
            'amount_dirt small and fabric soft => wash_time very_small',
            'amount_dirt medium and fabric ordinary => wash_time standard',
            'amount_dirt small and_not fabric soft or amount_dirt medium and fabric soft => wash_time small',
            'amount_dirt medium and fabric stiff => wash_time large',
            'amount_dirt large and_not fabric soft => wash_time very_large',
            'amount_dirt large and fabric soft => wash_time standard'
        ]
    rule=[]    
    for x in range(len(rules)):
        rule.append(add_rule(rules[x]))
    print(rule)
    fuzzy_values = fuzzification(variables_map)

    inferred_values = fuzzy_inference(fuzzy_values, rule)
    print("Inferred Values:", inferred_values)

    print(f"The predicted risk is {max(inferred_values['wash_time'])} {defuzzification(variables_map,inferred_values,'wash_time')}")
