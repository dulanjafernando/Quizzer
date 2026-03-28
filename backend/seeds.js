const mongoose = require('mongoose');
const MCQ = require('./models/MCQ');

const seedMCQs = async () => {
  const sampleMCQs = [
    // Physics Questions
    {
      category: 'Physics',
      question: 'What is the SI unit of force?',
      options: ['Joule', 'Newton', 'Watt', 'Pascal'],
      correctAnswer: 'Newton',
      timeLimit: 60,
      explanation: 'The SI unit of force is Newton (N), named after Isaac Newton.',
    },
    {
      category: 'Physics',
      question: 'What is the speed of light in vacuum?',
      options: ['3 × 10^6 m/s', '3 × 10^8 m/s', '3 × 10^10 m/s', '3 × 10^12 m/s'],
      correctAnswer: '3 × 10^8 m/s',
      timeLimit: 60,
      explanation: 'The speed of light in vacuum is approximately 3 × 10^8 m/s or 300,000 km/s.',
    },
    {
      category: 'Physics',
      question: 'Which law states that F = ma?',
      options: ['First law of motion', 'Second law of motion', 'Third law of motion', 'Law of gravitation'],
      correctAnswer: 'Second law of motion',
      timeLimit: 60,
      explanation: "Newton's second law of motion states that Force equals mass times acceleration (F = ma).",
    },

    // Chemistry Questions
    {
      category: 'Chemistry',
      question: 'What is the chemical formula for table salt?',
      options: ['KCl', 'NaCl', 'CaCl2', 'MgCl2'],
      correctAnswer: 'NaCl',
      timeLimit: 60,
      explanation: 'Table salt is sodium chloride with the chemical formula NaCl.',
    },
    {
      category: 'Chemistry',
      question: 'How many electrons does a neutral Oxygen atom have?',
      options: ['6', '8', '10', '12'],
      correctAnswer: '8',
      timeLimit: 60,
      explanation: 'Oxygen has an atomic number of 8, meaning it has 8 electrons in its neutral state.',
    },
    {
      category: 'Chemistry',
      question: 'What is the pH of pure water at 25°C?',
      options: ['0', '5', '7', '14'],
      correctAnswer: '7',
      timeLimit: 60,
      explanation: 'Pure water at 25°C has a pH of 7, which is neutral.',
    },

    // Biology Questions
    {
      category: 'Biology',
      question: 'What is the powerhouse of the cell?',
      options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi apparatus'],
      correctAnswer: 'Mitochondria',
      timeLimit: 60,
      explanation: 'Mitochondria is known as the powerhouse of the cell because it produces ATP (energy).',
    },
    {
      category: 'Biology',
      question: 'How many chromosomes do humans have?',
      options: ['23', '46', '48', '52'],
      correctAnswer: '46',
      timeLimit: 60,
      explanation: 'Humans have 46 chromosomes (23 pairs) in their diploid cells.',
    },
    {
      category: 'Biology',
      question: 'Which blood type is the universal donor?',
      options: ['A', 'B', 'AB', 'O'],
      correctAnswer: 'O',
      timeLimit: 60,
      explanation: 'O negative blood type is the universal donor and can be given to anyone.',
    },

    // Combined Maths Questions
    {
      category: 'Combined Maths',
      question: 'What is the derivative of x²?',
      options: ['x', '2x', 'x/2', '2x²'],
      correctAnswer: '2x',
      timeLimit: 90,
      explanation: 'The derivative of x² with respect to x is 2x.',
    },
    {
      category: 'Combined Maths',
      question: 'What is the sum of angles in a triangle?',
      options: ['90°', '180°', '270°', '360°'],
      correctAnswer: '180°',
      timeLimit: 60,
      explanation: 'The sum of all angles in any triangle is always 180 degrees.',
    },
    {
      category: 'Combined Maths',
      question: 'What is the value of sin(90°)?',
      options: ['0', '0.5', '1', 'undefined'],
      correctAnswer: '1',
      timeLimit: 60,
      explanation: 'The sine of 90 degrees is 1.',
    },

    // Electronics Questions
    {
      category: 'Electronics',
      question: 'What does LED stand for?',
      options: ['Light Emitting Diode', 'Low Energy Device', 'Light Energy Display', 'Luminous Electronic Device'],
      correctAnswer: 'Light Emitting Diode',
      timeLimit: 60,
      explanation: 'LED stands for Light Emitting Diode, a semiconductor device that emits light.',
    },
    {
      category: 'Electronics',
      question: 'What is Ohm\'s Law?',
      options: ['V = IR', 'V = I/R', 'V = R/I', 'V = I + R'],
      correctAnswer: 'V = IR',
      timeLimit: 60,
      explanation: 'Ohm\'s Law states that voltage (V) equals current (I) times resistance (R).',
    },
    {
      category: 'Electronics',
      question: 'What is the SI unit of electric current?',
      options: ['Volt', 'Ampere', 'Ohm', 'Watt'],
      correctAnswer: 'Ampere',
      timeLimit: 60,
      explanation: 'The SI unit of electric current is Ampere (A), named after André-Marie Ampère.',
    },

    // History Questions
    {
      category: 'History',
      question: 'In which year did the Titanic sink?',
      options: ['1912', '1920', '1905', '1898'],
      correctAnswer: '1912',
      timeLimit: 60,
      explanation: 'The RMS Titanic sank on April 15, 1912, after hitting an iceberg.',
    },
    {
      category: 'History',
      question: 'Who was the first President of the United States?',
      options: ['Thomas Jefferson', 'Benjamin Franklin', 'George Washington', 'John Adams'],
      correctAnswer: 'George Washington',
      timeLimit: 60,
      explanation: 'George Washington was the first President of the United States (1789-1797).',
    },
    {
      category: 'History',
      question: 'In which year did World War II end?',
      options: ['1943', '1944', '1945', '1946'],
      correctAnswer: '1945',
      timeLimit: 60,
      explanation: 'World War II ended in 1945 with the surrender of Japan on September 2, 1945.',
    },

    // Accounting Questions
    {
      category: 'Accounting',
      question: 'What is the accounting equation?',
      options: ['Assets - Liabilities = Equity', 'Assets = Liabilities - Equity', 'Assets = Liabilities + Equity', 'Assets + Equity = Liabilities'],
      correctAnswer: 'Assets = Liabilities + Equity',
      timeLimit: 90,
      explanation: 'The fundamental accounting equation is: Assets = Liabilities + Equity',
    },
    {
      category: 'Accounting',
      question: 'What is depreciation?',
      options: ['Increase in asset value', 'Decrease in asset value over time', 'Profit margin', 'Interest expense'],
      correctAnswer: 'Decrease in asset value over time',
      timeLimit: 60,
      explanation: 'Depreciation is the systematic allocation of the cost of an asset over its useful life.',
    },
    {
      category: 'Accounting',
      question: 'Which financial statement shows a company\'s profitability?',
      options: ['Balance Sheet', 'Income Statement', 'Cash Flow Statement', 'Statement of Changes in Equity'],
      correctAnswer: 'Income Statement',
      timeLimit: 60,
      explanation: 'The Income Statement (Profit & Loss Statement) shows a company\'s revenue, expenses, and profitability.',
    },

    // Information Technology Questions
    {
      category: 'Information Technology',
      question: 'What does HTML stand for?',
      options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlinks and Text Markup Language'],
      correctAnswer: 'Hyper Text Markup Language',
      timeLimit: 60,
      explanation: 'HTML stands for Hyper Text Markup Language, used for creating web pages.',
    },
    {
      category: 'Information Technology',
      question: 'What is the difference between var, let, and const in JavaScript?',
      options: ['No difference', 'scope and reassignment rules', 'Only performance difference', 'They are deprecated'],
      correctAnswer: 'scope and reassignment rules',
      timeLimit: 90,
      explanation: 'var, let, and const differ in scope (function vs block) and whether they can be reassigned or redeclared.',
    },
    {
      category: 'Information Technology',
      question: 'What does SQL stand for?',
      options: ['Structured Query Language', 'Simple Query Language', 'Standard Query Language', 'Structured Question Language'],
      correctAnswer: 'Structured Query Language',
      timeLimit: 60,
      explanation: 'SQL stands for Structured Query Language, used for managing databases.',
    },
  ];

  try {
    // Check if MCQs already exist
    const count = await MCQ.countDocuments();
    if (count === 0) {
      const mcqs = await MCQ.insertMany(sampleMCQs);
      console.log(`✓ Seeded ${mcqs.length} MCQs into database`);
      return true;
    } else {
      console.log(`ℹ Database already contains ${count} MCQs. Skipping seed.`);
      return false;
    }
  } catch (error) {
    console.error('✗ Error seeding MCQs:', error);
    return false;
  }
};

const seedDatabase = async () => {
  try {
    console.log('\n🌱 Seeding MCQ data into database...\n');
    await seedMCQs();
    console.log('\n✓ Database seeding completed successfully!\n');
    return true;
  } catch (error) {
    console.error('\n✗ Database seeding failed:', error);
    return false;
  }
};

// Export for use in server.js
module.exports = { seedDatabase, seedMCQs };
