import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BackendService } from '@/services/BackendService';

export interface Lesson {
  id: string;
  title: string;
  description: string;
  pythonCode: string;
  cppCode: string;
  challenge?: string;
  completed: boolean;
}

export interface PCComponent {
  id: string;
  name: string;
  type: 'cpu' | 'ram' | 'gpu' | 'motherboard' | 'storage' | 'psu' | 'cooling' | 'case';
  topic: string;
  description: string;
  pythonConcept: string;
  cppConcept: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isInstalled: boolean;
  position?: { x: number; y: number; z: number };
  color: string;
  icon: string;
  lessons: Lesson[];
  // Upgrade levels based on completed chapters
  upgradeLevel: number; // 0 = not started, 1-4 = upgrade levels
  maxUpgradeLevel: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'basics' | 'intermediate' | 'advanced' | 'special';
  requiredLessons: string[];
  unlocked: boolean;
  unlockedAt?: Date;
}

export interface GameState {
  currentLanguage: 'python' | 'cpp';
  playerLevel: number;
  xp: number;
  xpToNextLevel: number;
  codeGems: number;
  components: PCComponent[];
  installedComponents: string[];
  currentScreen: 'menu' | 'workshop' | 'lesson' | 'challenge' | 'achievements';
  selectedComponent: PCComponent | null;
  tutorDialogue: string;
  showTutor: boolean;
  achievements: Achievement[];
  newlyUnlockedAchievement: Achievement | null;
}

interface GameStore extends GameState {
  setLanguage: (lang: 'python' | 'cpp') => void;
  addXP: (amount: number) => void;
  setPlayerLevel: (level: number) => void;
  addCodeGems: (amount: number) => void;
  installComponent: (componentId: string) => void;
  uninstallComponent: (componentId: string) => void;
  setCurrentScreen: (screen: GameState['currentScreen']) => void;
  setScreen: (screen: GameState['currentScreen']) => void;
  selectComponent: (component: PCComponent | null) => void;
  setTutorDialogue: (dialogue: string) => void;
  toggleTutor: (show: boolean) => void;
  completeLesson: (componentId: string, lessonId: string) => void;
  checkAchievements: () => void;
  getCompletedLessonsCount: () => number;
  getTotalLessonsCount: () => number;
  clearNewAchievement: () => void;
  getComponentUpgradeLevel: (componentId: string) => number;
  submitPuzzleAttempt: (componentId: string, code: string, hintsUsed: number) => Promise<{ success: boolean; message: string }>;
  isComponentUnlocked: (componentId: string) => boolean;
}

const initialAchievements: Achievement[] = [
  {
    id: 'variable-master',
    name: 'Variable Master',
    description: 'Complete all lessons in Variables & Data Types',
    icon: '🧠',
    category: 'basics',
    requiredLessons: ['ram-1', 'ram-2', 'ram-3', 'ram-4'],
    unlocked: false
  },
  {
    id: 'loop-legend',
    name: 'Loop Legend',
    description: 'Master all loop concepts',
    icon: '🔄',
    category: 'basics',
    requiredLessons: ['gpu-1', 'gpu-2', 'gpu-3', 'gpu-4'],
    unlocked: false
  },
  {
    id: 'oop-champion',
    name: 'OOP Champion',
    description: 'Conquer Object-Oriented Programming',
    icon: '👑',
    category: 'advanced',
    requiredLessons: ['cooling-1', 'cooling-2', 'cooling-3', 'cooling-4'],
    unlocked: false
  },
  {
    id: 'function-wizard',
    name: 'Function Wizard',
    description: 'Master the art of functions',
    icon: '🧙',
    category: 'intermediate',
    requiredLessons: ['cpu-1', 'cpu-2', 'cpu-3', 'cpu-4'],
    unlocked: false
  },
  {
    id: 'array-architect',
    name: 'Array Architect',
    description: 'Build mastery over arrays and collections',
    icon: '🏗️',
    category: 'basics',
    requiredLessons: ['mb-1', 'mb-2', 'mb-3', 'mb-4'],
    unlocked: false
  },
  {
    id: 'conditional-commander',
    name: 'Conditional Commander',
    description: 'Control the flow of your programs',
    icon: '🎯',
    category: 'basics',
    requiredLessons: ['psu-1', 'psu-2', 'psu-3', 'psu-4'],
    unlocked: false
  },
  {
    id: 'file-handler',
    name: 'File Handler',
    description: 'Master reading and writing files',
    icon: '📁',
    category: 'intermediate',
    requiredLessons: ['storage-1', 'storage-2', 'storage-3', 'storage-4'],
    unlocked: false
  },
  {
    id: 'module-master',
    name: 'Module Master',
    description: 'Learn to organize code with modules',
    icon: '📦',
    category: 'intermediate',
    requiredLessons: ['case-1', 'case-2', 'case-3', 'case-4'],
    unlocked: false
  },
  {
    id: 'first-steps',
    name: 'First Steps',
    description: 'Complete your first lesson',
    icon: '👶',
    category: 'special',
    requiredLessons: [],
    unlocked: false
  },
  {
    id: 'dedicated-learner',
    name: 'Dedicated Learner',
    description: 'Complete 5 lessons',
    icon: '📚',
    category: 'special',
    requiredLessons: [],
    unlocked: false
  },
  {
    id: 'code-master',
    name: 'Code Master',
    description: 'Complete all available lessons',
    icon: '🏆',
    category: 'special',
    requiredLessons: [],
    unlocked: false
  }
];

const initialComponents: PCComponent[] = [
  {
    id: 'ram',
    name: 'RAM Module',
    type: 'ram',
    topic: 'Variables & Data Types',
    description: 'Like RAM stores temporary data, variables store values in your program.',
    pythonConcept: 'Variables in Python are dynamically typed - no declaration needed!',
    cppConcept: 'In C++, you must declare the type: int, float, char, etc.',
    difficulty: 'beginner',
    isInstalled: false,
    color: '#00d4ff',
    icon: '💾',
    upgradeLevel: 0,
    maxUpgradeLevel: 4,
    lessons: [
      {
        id: 'ram-1',
        title: 'Chapter 1: Basic Variables (1GB RAM)',
        description: 'Learn how to create variables and store simple data',
        pythonCode: '# Creating a variable in Python\nplayer_name = "CodeMaster"\nprint(f"Welcome {player_name}!")',
        cppCode: '// Creating a variable in C++\n#include <iostream>\nusing namespace std;\n\nint main() {\n    string player_name = "CodeMaster";\n    cout << "Welcome " << player_name << "!" << endl;\n    return 0;\n}',
        completed: false
      },
      {
        id: 'ram-2',
        title: 'Chapter 2: Data Types (2GB RAM)',
        description: 'Work with different data types - integers, floats, booleans',
        pythonCode: '# Different data types\nage = 25           # integer\nheight = 5.9       # float\nis_student = True  # boolean\nname = "Alex"      # string',
        cppCode: '// Different data types\nint age = 25;\nfloat height = 5.9f;\nbool is_student = true;\nstring name = "Alex";',
        challenge: 'Create variables to store: your age, favorite number, and whether you like coding',
        completed: false
      },
      {
        id: 'ram-3',
        title: 'Chapter 3: Type Conversion (4GB RAM)',
        description: 'Convert between different data types',
        pythonCode: '# Type conversion\nnum_str = "42"\nnum_int = int(num_str)  # String to int\nnum_float = float(num_int)  # Int to float\nprint(f"{num_str} -> {num_int} -> {num_float}")',
        cppCode: '// Type conversion\nstring num_str = "42";\nint num_int = stoi(num_str);  // String to int\nfloat num_float = static_cast<float>(num_int);\ncout << num_str << " -> " << num_int << " -> " << num_float << endl;',
        completed: false
      },
      {
        id: 'ram-4',
        title: 'Chapter 4: Advanced Variables (RGB Gaming RAM)',
        description: 'Master constants, references, and memory concepts',
        pythonCode: '# Constants and advanced concepts\nMAX_HEALTH = 100  # Constant by convention\nPLAYER_SPEED = 5.5\n\n# Multiple assignment\nx, y, z = 10, 20, 30\nprint(f"Position: ({x}, {y}, {z})")',
        cppCode: '// Constants and references\nconst int MAX_HEALTH = 100;\nconst float PLAYER_SPEED = 5.5f;\n\n// References\nint health = 100;\nint& healthRef = health;\nhealthRef -= 10;  // Changes original\ncout << "Health: " << health << endl;',
        completed: false
      }
    ]
  },
  {
    id: 'cpu',
    name: 'Processor (CPU)',
    type: 'cpu',
    topic: 'Functions & Logic',
    description: 'The CPU processes instructions, just like functions process code!',
    pythonConcept: 'Functions in Python use def keyword and can return any type.',
    cppConcept: 'C++ functions need return type declaration and can be overloaded.',
    difficulty: 'intermediate',
    isInstalled: false,
    color: '#a855f7',
    icon: '🧠',
    upgradeLevel: 0,
    maxUpgradeLevel: 4,
    lessons: [
      {
        id: 'cpu-1',
        title: 'Chapter 1: Basic Functions (Single Core)',
        description: 'Create your first reusable code block',
        pythonCode: '# Define a simple function\ndef greet(name):\n    return f"Hello, {name}!"\n\nprint(greet("Player"))',
        cppCode: '// Define a simple function\nstring greet(string name) {\n    return "Hello, " + name + "!";\n}\n\ncout << greet("Player") << endl;',
        completed: false
      },
      {
        id: 'cpu-2',
        title: 'Chapter 2: Parameters & Returns (Dual Core)',
        description: 'Functions with multiple parameters and return values',
        pythonCode: '# Multiple parameters\ndef calculate_damage(base, multiplier, critical=False):\n    damage = base * multiplier\n    if critical:\n        damage *= 2\n    return damage\n\nprint(calculate_damage(50, 1.5, True))',
        cppCode: '// Multiple parameters with default\nint calculateDamage(int base, float mult, bool crit = false) {\n    int damage = base * mult;\n    if (crit) damage *= 2;\n    return damage;\n}\n\ncout << calculateDamage(50, 1.5f, true) << endl;',
        completed: false
      },
      {
        id: 'cpu-3',
        title: 'Chapter 3: Recursion (Quad Core)',
        description: 'Functions that call themselves',
        pythonCode: '# Recursive function\ndef factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)\n\nprint(f"5! = {factorial(5)}")',
        cppCode: '// Recursive function\nint factorial(int n) {\n    if (n <= 1) return 1;\n    return n * factorial(n - 1);\n}\n\ncout << "5! = " << factorial(5) << endl;',
        completed: false
      },
      {
        id: 'cpu-4',
        title: 'Chapter 4: Lambda & Higher-Order (RGB Gaming CPU)',
        description: 'Anonymous functions and functions as parameters',
        pythonCode: '# Lambda functions\nsquare = lambda x: x ** 2\nnumbers = [1, 2, 3, 4, 5]\nsquared = list(map(square, numbers))\nprint(squared)  # [1, 4, 9, 16, 25]',
        cppCode: '// Lambda functions\nauto square = [](int x) { return x * x; };\nvector<int> nums = {1, 2, 3, 4, 5};\nfor (int n : nums) {\n    cout << square(n) << " ";\n}',
        completed: false
      }
    ]
  },
  {
    id: 'gpu',
    name: 'Graphics Card (GPU)',
    type: 'gpu',
    topic: 'Loops & Iterations',
    description: 'GPUs repeat operations millions of times - just like loops!',
    pythonConcept: 'Python has for loops and while loops with clean syntax.',
    cppConcept: 'C++ offers for, while, and do-while loops with more control.',
    difficulty: 'beginner',
    isInstalled: false,
    color: '#22c55e',
    icon: '🎮',
    upgradeLevel: 0,
    maxUpgradeLevel: 4,
    lessons: [
      {
        id: 'gpu-1',
        title: 'Chapter 1: For Loops (GTX 1050)',
        description: 'Repeat code a specific number of times',
        pythonCode: '# For loop basics\nfor frame in range(5):\n    print(f"Rendering frame {frame}")',
        cppCode: '// For loop basics\nfor (int frame = 0; frame < 5; frame++) {\n    cout << "Rendering frame " << frame << endl;\n}',
        completed: false
      },
      {
        id: 'gpu-2',
        title: 'Chapter 2: While Loops (RTX 2060)',
        description: 'Loop until a condition is met',
        pythonCode: '# While loop\nhealth = 100\nwhile health > 0:\n    print(f"Health: {health}")\n    health -= 25',
        cppCode: '// While loop\nint health = 100;\nwhile (health > 0) {\n    cout << "Health: " << health << endl;\n    health -= 25;\n}',
        completed: false
      },
      {
        id: 'gpu-3',
        title: 'Chapter 3: Nested Loops (RTX 3070)',
        description: 'Loops within loops for complex iterations',
        pythonCode: '# Nested loops - render a grid\nfor row in range(3):\n    for col in range(3):\n        print(f"({row},{col})", end=" ")\n    print()',
        cppCode: '// Nested loops - render a grid\nfor (int row = 0; row < 3; row++) {\n    for (int col = 0; col < 3; col++) {\n        cout << "(" << row << "," << col << ") ";\n    }\n    cout << endl;\n}',
        completed: false
      },
      {
        id: 'gpu-4',
        title: 'Chapter 4: Loop Mastery (RTX 4090 RGB)',
        description: 'Break, continue, and loop optimization',
        pythonCode: '# Advanced loop control\nfor i in range(10):\n    if i == 3:\n        continue  # Skip 3\n    if i == 7:\n        break     # Stop at 7\n    print(i, end=" ")',
        cppCode: '// Advanced loop control\nfor (int i = 0; i < 10; i++) {\n    if (i == 3) continue;\n    if (i == 7) break;\n    cout << i << " ";\n}',
        completed: false
      }
    ]
  },
  {
    id: 'motherboard',
    name: 'Motherboard',
    type: 'motherboard',
    topic: 'Arrays & Collections',
    description: 'The motherboard connects everything - arrays connect data elements!',
    pythonConcept: 'Python lists are dynamic and can hold mixed types.',
    cppConcept: 'C++ arrays are fixed-size, but vectors provide flexibility.',
    difficulty: 'intermediate',
    isInstalled: false,
    color: '#f59e0b',
    icon: '🔌',
    upgradeLevel: 0,
    maxUpgradeLevel: 4,
    lessons: [
      {
        id: 'mb-1',
        title: 'Chapter 1: Basic Arrays (Budget Board)',
        description: 'Store multiple values in one structure',
        pythonCode: '# Python list\ncomponents = ["CPU", "RAM", "GPU"]\nprint(components[0])  # CPU',
        cppCode: '// C++ array\nstring components[] = {"CPU", "RAM", "GPU"};\ncout << components[0] << endl;  // CPU',
        completed: false
      },
      {
        id: 'mb-2',
        title: 'Chapter 2: List Operations (Gaming Board)',
        description: 'Add, remove, and modify array elements',
        pythonCode: '# List operations\nparts = ["CPU", "RAM"]\nparts.append("GPU")    # Add\nparts.remove("RAM")    # Remove\nparts[0] = "Ryzen"     # Modify\nprint(parts)',
        cppCode: '// Vector operations\nvector<string> parts = {"CPU", "RAM"};\nparts.push_back("GPU");\nparts.erase(parts.begin() + 1);\nparts[0] = "Ryzen";\nfor (auto p : parts) cout << p << " ";',
        completed: false
      },
      {
        id: 'mb-3',
        title: 'Chapter 3: 2D Arrays (ATX Board)',
        description: 'Multi-dimensional arrays for complex data',
        pythonCode: '# 2D array - game board\nboard = [\n    [1, 2, 3],\n    [4, 5, 6],\n    [7, 8, 9]\n]\nprint(board[1][1])  # 5',
        cppCode: '// 2D array - game board\nint board[3][3] = {\n    {1, 2, 3},\n    {4, 5, 6},\n    {7, 8, 9}\n};\ncout << board[1][1] << endl;  // 5',
        completed: false
      },
      {
        id: 'mb-4',
        title: 'Chapter 4: Advanced Collections (RGB Gaming E-ATX)',
        description: 'Dictionaries, sets, and advanced data structures',
        pythonCode: '# Dictionary for game inventory\ninventory = {\n    "sword": 1,\n    "potion": 5,\n    "gold": 100\n}\ninventory["armor"] = 1\nprint(inventory)',
        cppCode: '// Map for game inventory\nmap<string, int> inventory;\ninventory["sword"] = 1;\ninventory["potion"] = 5;\ninventory["gold"] = 100;\nfor (auto& item : inventory) {\n    cout << item.first << ": " << item.second << endl;\n}',
        completed: false
      }
    ]
  },
  {
    id: 'storage',
    name: 'Storage (SSD/HDD)',
    type: 'storage',
    topic: 'File I/O & Persistence',
    description: 'Storage keeps data permanent - like saving files in code!',
    pythonConcept: 'Python uses open() with context managers for safe file handling.',
    cppConcept: 'C++ uses fstream library for file operations.',
    difficulty: 'advanced',
    isInstalled: false,
    color: '#ec4899',
    icon: '💿',
    upgradeLevel: 0,
    maxUpgradeLevel: 4,
    lessons: [
      {
        id: 'storage-1',
        title: 'Chapter 1: Reading Files (256GB HDD)',
        description: 'Read data from files',
        pythonCode: '# Read from file\nwith open("data.txt", "r") as file:\n    content = file.read()\n    print(content)',
        cppCode: '// Read from file\nifstream file("data.txt");\nstring content;\ngetline(file, content);\ncout << content << endl;',
        completed: false
      },
      {
        id: 'storage-2',
        title: 'Chapter 2: Writing Files (512GB SSD)',
        description: 'Write and save data to files',
        pythonCode: '# Write to file\nwith open("save.txt", "w") as file:\n    file.write("Level: 5\\n")\n    file.write("Score: 1000")',
        cppCode: '// Write to file\nofstream file("save.txt");\nfile << "Level: 5" << endl;\nfile << "Score: 1000" << endl;\nfile.close();',
        completed: false
      },
      {
        id: 'storage-3',
        title: 'Chapter 3: File Modes (1TB NVMe)',
        description: 'Append, binary, and different file modes',
        pythonCode: '# Append to file\nwith open("log.txt", "a") as file:\n    file.write("New entry\\n")\n\n# Binary mode\nwith open("data.bin", "wb") as file:\n    file.write(bytes([0x48, 0x69]))',
        cppCode: '// Append mode\nofstream log("log.txt", ios::app);\nlog << "New entry" << endl;\n\n// Binary mode\nofstream bin("data.bin", ios::binary);\nchar data[] = {0x48, 0x69};\nbin.write(data, 2);',
        completed: false
      },
      {
        id: 'storage-4',
        title: 'Chapter 4: Serialization (2TB RGB NVMe)',
        description: 'Save complex objects and game states',
        pythonCode: '# JSON serialization\nimport json\n\ngame_state = {\n    "player": "Hero",\n    "level": 10,\n    "inventory": ["sword", "shield"]\n}\n\nwith open("save.json", "w") as f:\n    json.dump(game_state, f)',
        cppCode: '// Custom serialization\nstruct GameState {\n    string player;\n    int level;\n};\n\nofstream file("save.dat", ios::binary);\nGameState state = {"Hero", 10};\nfile.write(state.player.c_str(), 10);\nfile.write((char*)&state.level, sizeof(int));',
        completed: false
      }
    ]
  },
  {
    id: 'psu',
    name: 'Power Supply (PSU)',
    type: 'psu',
    topic: 'Conditionals & Control Flow',
    description: 'PSU decides power distribution - conditionals decide code paths!',
    pythonConcept: 'Python uses if/elif/else with indentation for blocks.',
    cppConcept: 'C++ uses if/else if/else with curly braces for scope.',
    difficulty: 'beginner',
    isInstalled: false,
    color: '#ef4444',
    icon: '⚡',
    upgradeLevel: 0,
    maxUpgradeLevel: 4,
    lessons: [
      {
        id: 'psu-1',
        title: 'Chapter 1: If Statements (450W Basic)',
        description: 'Basic conditional logic',
        pythonCode: '# Simple if statement\npower = 80\nif power > 50:\n    print("Sufficient power!")',
        cppCode: '// Simple if statement\nint power = 80;\nif (power > 50) {\n    cout << "Sufficient power!" << endl;\n}',
        completed: false
      },
      {
        id: 'psu-2',
        title: 'Chapter 2: If-Else (650W Bronze)',
        description: 'Two-way conditional branching',
        pythonCode: '# If-else\npower = 30\nif power >= 50:\n    print("Normal mode")\nelse:\n    print("Power saving mode")',
        cppCode: '// If-else\nint power = 30;\nif (power >= 50) {\n    cout << "Normal mode" << endl;\n} else {\n    cout << "Power saving mode" << endl;\n}',
        completed: false
      },
      {
        id: 'psu-3',
        title: 'Chapter 3: Multiple Conditions (850W Gold)',
        description: 'elif/else if chains and logical operators',
        pythonCode: '# Multiple conditions\npower = 75\nif power >= 90:\n    print("Turbo mode!")\nelif power >= 50:\n    print("Balanced mode")\nelif power >= 20:\n    print("Eco mode")\nelse:\n    print("Critical!")',
        cppCode: '// Multiple conditions\nint power = 75;\nif (power >= 90) {\n    cout << "Turbo mode!" << endl;\n} else if (power >= 50) {\n    cout << "Balanced mode" << endl;\n} else if (power >= 20) {\n    cout << "Eco mode" << endl;\n} else {\n    cout << "Critical!" << endl;\n}',
        completed: false
      },
      {
        id: 'psu-4',
        title: 'Chapter 4: Switch & Ternary (1200W RGB Platinum)',
        description: 'Switch statements and conditional expressions',
        pythonCode: '# Ternary operator\npower = 80\nstatus = "OK" if power > 50 else "LOW"\n\n# Match statement (Python 3.10+)\nmatch power // 25:\n    case 0: print("Critical")\n    case 1: print("Low")\n    case 2: print("Medium")\n    case _: print("High")',
        cppCode: '// Ternary operator\nint power = 80;\nstring status = (power > 50) ? "OK" : "LOW";\n\n// Switch statement\nswitch (power / 25) {\n    case 0: cout << "Critical"; break;\n    case 1: cout << "Low"; break;\n    case 2: cout << "Medium"; break;\n    default: cout << "High";\n}',
        completed: false
      }
    ]
  },
  {
    id: 'cooling',
    name: 'Cooling System',
    type: 'cooling',
    topic: 'Object-Oriented Programming',
    description: 'Cooling manages temperature - OOP manages code organization!',
    pythonConcept: 'Python classes use self and __init__ for construction.',
    cppConcept: 'C++ classes have access modifiers: public, private, protected.',
    difficulty: 'advanced',
    isInstalled: false,
    color: '#06b6d4',
    icon: '❄️',
    upgradeLevel: 0,
    maxUpgradeLevel: 4,
    lessons: [
      {
        id: 'cooling-1',
        title: 'Chapter 1: Classes & Objects (Stock Cooler)',
        description: 'Create your first class',
        pythonCode: '# Basic class\nclass Fan:\n    def __init__(self, rpm):\n        self.rpm = rpm\n\nfan = Fan(1500)\nprint(fan.rpm)',
        cppCode: '// Basic class\nclass Fan {\npublic:\n    int rpm;\n    Fan(int r) : rpm(r) {}\n};\n\nFan fan(1500);\ncout << fan.rpm << endl;',
        completed: false
      },
      {
        id: 'cooling-2',
        title: 'Chapter 2: Methods (Tower Cooler)',
        description: 'Add behavior to your classes',
        pythonCode: '# Class with methods\nclass Cooler:\n    def __init__(self, max_rpm):\n        self.max_rpm = max_rpm\n        self.current = 0\n    \n    def set_speed(self, percent):\n        self.current = self.max_rpm * percent / 100\n        return self.current',
        cppCode: '// Class with methods\nclass Cooler {\n    int maxRpm, current;\npublic:\n    Cooler(int max) : maxRpm(max), current(0) {}\n    int setSpeed(int percent) {\n        current = maxRpm * percent / 100;\n        return current;\n    }\n};',
        completed: false
      },
      {
        id: 'cooling-3',
        title: 'Chapter 3: Inheritance (AIO Cooler)',
        description: 'Extend classes and inherit behavior',
        pythonCode: '# Inheritance\nclass Cooler:\n    def cool(self):\n        return "Cooling..."\n\nclass LiquidCooler(Cooler):\n    def cool(self):\n        return "Liquid cooling!"\n\naio = LiquidCooler()\nprint(aio.cool())',
        cppCode: '// Inheritance\nclass Cooler {\npublic:\n    virtual string cool() {\n        return "Cooling...";\n    }\n};\n\nclass LiquidCooler : public Cooler {\npublic:\n    string cool() override {\n        return "Liquid cooling!";\n    }\n};',
        completed: false
      },
      {
        id: 'cooling-4',
        title: 'Chapter 4: Advanced OOP (Custom Loop RGB)',
        description: 'Polymorphism, encapsulation, and design patterns',
        pythonCode: '# Abstract class & polymorphism\nfrom abc import ABC, abstractmethod\n\nclass CoolingDevice(ABC):\n    @abstractmethod\n    def cool(self): pass\n\nclass AirCooler(CoolingDevice):\n    def cool(self): return "Fan spinning!"\n\nclass Liquid(CoolingDevice):\n    def cool(self): return "Pump running!"',
        cppCode: '// Abstract class & polymorphism\nclass CoolingDevice {\npublic:\n    virtual string cool() = 0;\n    virtual ~CoolingDevice() {}\n};\n\nclass AirCooler : public CoolingDevice {\npublic:\n    string cool() override { return "Fan spinning!"; }\n};\n\nclass Liquid : public CoolingDevice {\npublic:\n    string cool() override { return "Pump running!"; }\n};',
        completed: false
      }
    ]
  },
  {
    id: 'case',
    name: 'PC Case',
    type: 'case',
    topic: 'Project Structure & Modules',
    description: 'The case holds everything together - modules organize your code!',
    pythonConcept: 'Python uses import statements and packages for modularity.',
    cppConcept: 'C++ uses #include headers and namespaces for organization.',
    difficulty: 'intermediate',
    isInstalled: false,
    color: '#8b5cf6',
    icon: '🖥️',
    upgradeLevel: 0,
    maxUpgradeLevel: 4,
    lessons: [
      {
        id: 'case-1',
        title: 'Chapter 1: Imports (Basic Tower)',
        description: 'Import and use modules',
        pythonCode: '# Import module\nimport math\nprint(math.sqrt(16))  # 4.0\n\nfrom random import randint\nprint(randint(1, 10))',
        cppCode: '// Include headers\n#include <cmath>\n#include <cstdlib>\n\ncout << sqrt(16) << endl;  // 4\ncout << rand() % 10 << endl;',
        completed: false
      },
      {
        id: 'case-2',
        title: 'Chapter 2: Creating Modules (Mid Tower)',
        description: 'Create your own reusable modules',
        pythonCode: '# mymodule.py\ndef greet(name):\n    return f"Hello, {name}!"\n\n# main.py\nfrom mymodule import greet\nprint(greet("Player"))',
        cppCode: '// mymodule.h\n#pragma once\nstring greet(string name) {\n    return "Hello, " + name + "!";\n}\n\n// main.cpp\n#include "mymodule.h"\ncout << greet("Player") << endl;',
        completed: false
      },
      {
        id: 'case-3',
        title: 'Chapter 3: Packages (Full Tower)',
        description: 'Organize code into packages and namespaces',
        pythonCode: '# game/\n#   __init__.py\n#   player.py\n#   enemy.py\n\nfrom game.player import Player\nfrom game.enemy import Enemy\n\nhero = Player("Hero")\nboss = Enemy("Dragon")',
        cppCode: '// Namespaces\nnamespace game {\n    class Player { };\n    class Enemy { };\n}\n\ngame::Player hero;\ngame::Enemy boss;',
        completed: false
      },
      {
        id: 'case-4',
        title: 'Chapter 4: Project Architecture (RGB Gaming Case)',
        description: 'Design patterns and project structure',
        pythonCode: '# Project structure\n# src/\n#   main.py\n#   models/\n#   controllers/\n#   views/\n#   utils/\n\n# MVC pattern example\nclass Model:\n    data = []\n\nclass View:\n    def render(self, data): pass\n\nclass Controller:\n    def __init__(self, model, view):\n        self.model = model\n        self.view = view',
        cppCode: '// Project structure with headers\n// include/\n//   models.h\n//   controllers.h\n//   views.h\n// src/\n//   main.cpp\n//   models.cpp\n\nclass Model { vector<int> data; };\nclass View { void render(); };\nclass Controller {\n    Model* model;\n    View* view;\n};',
        completed: false
      }
    ]
  }
];

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      currentLanguage: 'python',
      playerLevel: 1,
      xp: 0,
      xpToNextLevel: 100,
      codeGems: 0,
      components: initialComponents,
      installedComponents: [],
      currentScreen: 'menu',
      selectedComponent: null,
      tutorDialogue: "Welcome to CodeLeva Quest! I'm Leva, your programming tutor. Let's build a PC and learn to code!",
      showTutor: true,
      achievements: initialAchievements,
      newlyUnlockedAchievement: null,

      setLanguage: (lang) => set({ currentLanguage: lang }),

      addXP: (amount) => {
        set((state) => ({ xp: state.xp + amount }));
      },

      setPlayerLevel: (level) => set({ playerLevel: level }),

      addCodeGems: (amount) => set((state) => ({ codeGems: state.codeGems + amount })),

      installComponent: (componentId) => set((state) => ({
        installedComponents: [...state.installedComponents, componentId],
        components: state.components.map(c =>
          c.id === componentId ? { ...c, isInstalled: true } : c
        )
      })),

      uninstallComponent: (componentId) => set((state) => ({
        installedComponents: state.installedComponents.filter(id => id !== componentId),
        components: state.components.map(c =>
          c.id === componentId ? { ...c, isInstalled: false } : c
        )
      })),

      setCurrentScreen: (screen) => set({ currentScreen: screen }),
      setScreen: (screen) => set({ currentScreen: screen }),

      selectComponent: (component) => set({ selectedComponent: component }),

      setTutorDialogue: (dialogue) => set({ tutorDialogue: dialogue }),

      toggleTutor: (show) => set({ showTutor: show }),

      completeLesson: (componentId, lessonId) => {
        set((state) => {
          const updatedComponents = state.components.map(c => {
            if (c.id === componentId) {
              const updatedLessons = c.lessons.map(l =>
                l.id === lessonId ? { ...l, completed: true } : l
              );
              // Calculate upgrade level based on completed lessons
              const completedCount = updatedLessons.filter(l => l.completed).length;
              const newUpgradeLevel = Math.min(completedCount, c.maxUpgradeLevel);

              return {
                ...c,
                lessons: updatedLessons,
                upgradeLevel: newUpgradeLevel,
                // Auto-install when first lesson is completed
                isInstalled: completedCount > 0 ? true : c.isInstalled
              };
            }
            return c;
          });

          // Auto-add to installed components if first lesson completed
          const component = updatedComponents.find(c => c.id === componentId);
          const wasInstalled = state.installedComponents.includes(componentId);
          const shouldInstall = component && component.upgradeLevel > 0 && !wasInstalled;

          return {
            components: updatedComponents,
            installedComponents: shouldInstall
              ? [...state.installedComponents, componentId]
              : state.installedComponents
          };
        });
        // Auto-check achievements after completing a lesson
        setTimeout(() => get().checkAchievements(), 100);
      },

      getComponentUpgradeLevel: (componentId: string) => {
        const component = get().components.find(c => c.id === componentId);
        return component?.upgradeLevel || 0;
      },

      submitPuzzleAttempt: async (componentId, code, hintsUsed) => {
        const state = get();
        const component = state.components.find(c => c.id === componentId);
        if (!component) return { success: false, message: 'Component not found' };

        const lessonIndex = component.lessons.findIndex(l => !l.completed);
        if (lessonIndex === -1) return { success: false, message: 'All lessons completed' };

        const result = await BackendService.validateAttempt(component.type, lessonIndex, code, hintsUsed);

        if (result.success && result.rewards) {
          const { completeLesson, addXP, addCodeGems, setPlayerLevel } = get();
          completeLesson(componentId, component.lessons[lessonIndex].id);
          addXP(result.rewards.xp);
          addCodeGems(result.rewards.gems);
          if (result.rewards.levelUp) {
            setPlayerLevel(result.rewards.newLevel);
          }
        }

        return { success: result.success, message: result.message };
      },

      isComponentUnlocked: (componentId) => {
        const state = get();
        const index = state.components.findIndex(c => c.id === componentId);
        if (index === -1) return false;
        if (index === 0) return true;

        const currentComp = state.components[index];
        const prevComp = state.components[index - 1];

        // Logic preserved from UI: Unlocked if current is started OR previous is started
        // Ideally this should probably be "Previous is DONE", but refactoring behavior is out of scope.
        // We strictly adhere to moving the *existing* logic first.
        return (currentComp.upgradeLevel > 0) || (prevComp.upgradeLevel > 0);
      },

      checkAchievements: () => { }, // Deprecated, moved to backend

      getCompletedLessonsCount: () => {
        return get().components
          .flatMap((comp) => comp.lessons)
          .filter((lesson) => lesson.completed).length;
      },

      getTotalLessonsCount: () => {
        return get().components.reduce(
          (acc, comp) => acc + comp.lessons.length,
          0
        );
      },

      clearNewAchievement: () => set({ newlyUnlockedAchievement: null })
    }),
    {
      name: 'codeleva-quest-storage'
    }
  )
);
