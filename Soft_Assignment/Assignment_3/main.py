
class set:
   def __init__(self,variablein1=None,variableIn2 =None,operator =None,variableOut = None):
      self.variablein1 = variablein1
      self.variableIn2 =variableIn2
      self.operator =operator
      self.variableOut = variableOut

class variable:
   def __init__(self,name=None,type =None,range1=None,range2=None):
      self.name = name
      self.type = type
      self.rang1 = range1
      self.rang2 = range2
      self.set = []
  

if __name__ == '__main__':
    print("Fuzzy Logic Toolbox")
    print("===================")
    while(True):
     print("1- Create a new fuzzy system")
     print("2- Quit ")
     choice = int(input())
     if(choice==2):
        break
     elif(choice==1):
        print("Enter the system’s name and a brief description: ")
        Project_name = input()
        description = input()
        variables = []
        rules = []
        print("========== ")
        while(True):
            print("Main Menu: ")
            print("========== ")
            print("1- Add variables.")
            print("2- Add fuzzy sets to an existing variable.")
            print("3- Add rules. ")
            print("4- Run the simulation on crisp values.")
            print("==========")
            option= input("enter your choice or  close to end fuzzy task: ")
            if(option=="close"):
               break
            elif(option=="1"):
             print("Enter the variable’s name, type (IN/OUT) and range ([lower, upper]): (Press x to finish)")
             c1 = None
             while(c1!="x"):
              variable_name = input()
              variable_type = input()
              variable_rl= input()
              variable_ru = input()
              v = variable(variable_name,variable_type,variable_rl,variable_ru)
              variables.append(v)
              c1 = input()   
            elif(option=="4"):
               if(variables.count==0):
                  print("CAN’T START THE SIMULATION! Please add the fuzzy sets and rules first.")
            else:
               print("invalid choice!, please try again")   
         
     else:
        print("invalid choice!, please try again")    
 
print("you exit the program!")