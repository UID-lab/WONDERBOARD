import "dotenv/config";
import mongoose from "mongoose";
import connectDatabase from "../config/database.config";
import TaskModel from "../models/task.model";

const testDateFilter = async () => {
  console.log("📅 Starting date filter test...");

  try {
    await connectDatabase();

    // Get some sample tasks to see their dates
    console.log("📋 Sample tasks with dates:");
    const sampleTasks = await TaskModel.find({})
      .limit(10)
      .select("title createdAt dueDate")
      .sort({ createdAt: -1 });

    sampleTasks.forEach((task, index) => {
      console.log(`${index + 1}. "${task.title}"`);
      console.log(`   Created: ${task.createdAt}`);
      console.log(`   Due: ${task.dueDate || 'No due date'}`);
      console.log('---');
    });

    // Test date filtering with correct year (2025)
    const testFromDate = '2025-10-22';
    const testToDate = '2025-10-25';
    
    console.log(`📅 Testing created date filter: ${testFromDate} to ${testToDate}`);
    
    const query = {
      createdAt: {
        $gte: new Date(testFromDate),
        $lte: new Date(testToDate + 'T23:59:59.999Z')
      }
    };
    
    console.log('🔍 MongoDB query:', JSON.stringify(query, null, 2));
    
    const filteredTasks = await TaskModel.find(query)
      .select("title createdAt dueDate")
      .sort({ createdAt: -1 });
    
    console.log(`📊 Found ${filteredTasks.length} tasks in date range`);
    
    if (filteredTasks.length > 0) {
      console.log("📋 Filtered tasks:");
      filteredTasks.slice(0, 5).forEach((task, index) => {
        console.log(`${index + 1}. "${task.title}" - Created: ${task.createdAt}`);
      });
    }

    console.log("🎉 Date filter test completed!");
  } catch (error) {
    console.error("❌ Date filter test failed:", error);
  } finally {
    await mongoose.connection.close();
  }
};

testDateFilter().catch((error) =>
  console.error("Error running date filter test:", error)
);