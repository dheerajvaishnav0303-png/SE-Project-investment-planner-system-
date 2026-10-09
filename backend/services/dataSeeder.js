import User from '../models/User.js';
import InvestmentPlan from '../models/InvestmentPlan.js';
import Investment from '../models/Investment.js';
import Transaction from '../models/Transaction.js';
import Notification from '../models/Notification.js';
import FinancialProfile from '../models/FinancialProfile.js';

export const seedInitialDatabase = async () => {
  try {
    // 1. Seed / Ensure Admin User
    let admin = await User.findOne({ email: 'admin@investplan.com' });
    if (!admin) {
      admin = await User.create({
        name: 'Chief Investment Officer',
        email: 'admin@investplan.com',
        password: 'admin123',
        phone: '+91 99999 88888',
        role: 'admin',
        status: 'active'
      });
      console.log('[Seeder] Admin user created: admin@investplan.com / admin123');
    }

    // 2. Seed / Ensure Default Customer User
    let primaryUser = await User.findOne({ email: 'user@investplan.com' });
    if (!primaryUser) {
      primaryUser = await User.create({
        name: 'Alex Johnson',
        email: 'user@investplan.com',
        password: 'user123',
        phone: '+91 98765 43210',
        role: 'customer',
        status: 'active',
        walletBalance: 45000
      });
      console.log('[Seeder] Customer user created: user@investplan.com / user123');
    }

    // Additional Customer Users
    const additionalCustomers = [
      {
        name: 'Priya Sharma',
        email: 'priya.sharma@example.com',
        password: 'user123',
        phone: '+91 98765 11001',
        role: 'customer',
        status: 'active',
        walletBalance: 32000
      },
      {
        name: 'David Miller',
        email: 'david.miller@example.com',
        password: 'user123',
        phone: '+91 98765 22002',
        role: 'customer',
        status: 'active',
        walletBalance: 65000
      },
      {
        name: 'Aarav Patel',
        email: 'aarav.patel@example.com',
        password: 'user123',
        phone: '+91 98765 33003',
        role: 'customer',
        status: 'active',
        walletBalance: 18000
      }
    ];

    const customerDocs = [primaryUser];
    for (const cust of additionalCustomers) {
      let doc = await User.findOne({ email: cust.email });
      if (!doc) {
        doc = await User.create(cust);
      }
      customerDocs.push(doc);
    }

    // 3. Seed Investment Plans if none exist
    let plansCount = await InvestmentPlan.countDocuments();
    if (plansCount === 0) {
      const plans = [
        {
          name: 'Bluechip Alpha Growth Plan',
          category: 'Equity',
          riskLevel: 'Moderate',
          expectedReturn: 14.5,
          minInvestment: 5000,
          durationMonths: 36,
          description: 'Focuses on premier large-cap corporations and blue-chip equities with market dominance and steady compounding.',
          status: 'active',
          featured: true,
          assetAllocation: [
            { assetClass: 'Large-Cap Index Equities', percentage: 70, color: '#10b981' },
            { assetClass: 'Corporate Debt & Bonds', percentage: 20, color: '#3b82f6' },
            { assetClass: 'Liquid Cash Buffer', percentage: 10, color: '#64748b' }
          ],
          createdBy: admin._id
        },
        {
          name: 'Sovereign Debt & Bond Shield',
          category: 'Debt',
          riskLevel: 'Low',
          expectedReturn: 8.2,
          minInvestment: 1000,
          durationMonths: 12,
          description: 'High-grade government securities, treasury bills, and AAA corporate bonds for capital preservation and stable periodic yield.',
          status: 'active',
          featured: false,
          assetAllocation: [
            { assetClass: 'Government Securities', percentage: 65, color: '#3b82f6' },
            { assetClass: 'AAA Corporate Debt', percentage: 25, color: '#6366f1' },
            { assetClass: 'Cash Equivalents', percentage: 10, color: '#64748b' }
          ],
          createdBy: admin._id
        },
        {
          name: 'Balanced Wealth Accumulator',
          category: 'Hybrid',
          riskLevel: 'Moderate',
          expectedReturn: 11.8,
          minInvestment: 2500,
          durationMonths: 24,
          description: 'Dynamically rebalanced mix of diversified equity funds and fixed income instruments designed to cushion against market volatility.',
          status: 'active',
          featured: true,
          assetAllocation: [
            { assetClass: 'Core Equities', percentage: 50, color: '#10b981' },
            { assetClass: 'High-Yield Debt', percentage: 35, color: '#3b82f6' },
            { assetClass: 'Gold & Commodities', percentage: 15, color: '#f59e0b' }
          ],
          createdBy: admin._id
        },
        {
          name: 'Tech Disruption & High-Alpha Fund',
          category: 'High Growth',
          riskLevel: 'High',
          expectedReturn: 18.0,
          minInvestment: 10000,
          durationMonths: 60,
          description: 'Aggressive capital expansion fund concentrated in disruptive AI, cloud software, fintech, and semiconductor leaders.',
          status: 'active',
          featured: true,
          assetAllocation: [
            { assetClass: 'Global Tech Equities', percentage: 80, color: '#8b5cf6' },
            { assetClass: 'Mid & Small-Cap Alpha', percentage: 15, color: '#ec4899' },
            { assetClass: 'Tactical Cash', percentage: 5, color: '#64748b' }
          ],
          createdBy: admin._id
        },
        {
          name: 'Gold & Precious Metals Hedge',
          category: 'Commodities',
          riskLevel: 'Low',
          expectedReturn: 9.5,
          minInvestment: 1000,
          durationMonths: 12,
          description: 'Physical gold-backed securities and precious sovereign metals serving as a systemic macro hedge against currency inflation.',
          status: 'active',
          featured: false,
          assetAllocation: [
            { assetClass: 'Sovereign Gold Bonds', percentage: 80, color: '#f59e0b' },
            { assetClass: 'Silver & Precious Metals', percentage: 20, color: '#cbd5e1' }
          ],
          createdBy: admin._id
        }
      ];

      for (const p of plans) {
        await InvestmentPlan.create(p);
      }
      console.log('[Seeder] 5 Investment Plans created');
    }

    // 4. Seed Investments if none exist
    const planDocs = await InvestmentPlan.find();
    let investmentsCount = await Investment.countDocuments();
    if (investmentsCount === 0 && planDocs.length > 0) {
      const investments = [
        {
          user: customerDocs[0]._id, // Alex Johnson
          plan: planDocs[0]._id,
          amount: 50000,
          currentValue: 57250,
          returns: 7250,
          returnPercentage: 14.5,
          startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180), // 6 months ago
          maturityDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 900),
          status: 'Active',
          notes: 'Primary equity growth tranche'
        },
        {
          user: customerDocs[0]._id, // Alex Johnson
          plan: planDocs[2]._id,
          amount: 25000,
          currentValue: 27950,
          returns: 2950,
          returnPercentage: 11.8,
          startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 120),
          maturityDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 600),
          status: 'Active',
          notes: 'Balanced wealth tranche'
        },
        {
          user: customerDocs[1]._id, // Priya Sharma
          plan: planDocs[0]._id,
          amount: 80000,
          currentValue: 92400,
          returns: 12400,
          returnPercentage: 15.5,
          startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 240),
          status: 'Active'
        },
        {
          user: customerDocs[2]._id, // David Miller
          plan: planDocs[1]._id,
          amount: 150000,
          currentValue: 162300,
          returns: 12300,
          returnPercentage: 8.2,
          startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 300),
          status: 'Active'
        },
        {
          user: customerDocs[3]._id, // Aarav Patel
          plan: planDocs[3]._id,
          amount: 40000,
          currentValue: 47600,
          returns: 7600,
          returnPercentage: 19.0,
          startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90),
          status: 'Active'
        }
      ];

      for (const inv of investments) {
        await Investment.create(inv);
      }
      console.log('[Seeder] Initial customer investments created');
    }

    // 5. Seed Transactions if none exist
    let transactionsCount = await Transaction.countDocuments();
    if (transactionsCount === 0 && planDocs.length > 0) {
      const transactions = [
        {
          transactionId: 'TXN-902144',
          user: customerDocs[0]._id,
          type: 'Deposit',
          amount: 75000,
          paymentMethod: 'Bank Transfer',
          status: 'Completed',
          description: 'Account initial funding via Net Banking',
          actionDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 185)
        },
        {
          transactionId: 'TXN-902145',
          user: customerDocs[0]._id,
          type: 'Investment',
          amount: 50000,
          plan: planDocs[0]._id,
          paymentMethod: 'Wallet Balance',
          status: 'Completed',
          description: 'Deployed into Bluechip Alpha Growth Plan',
          actionDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180)
        },
        {
          transactionId: 'TXN-902146',
          user: customerDocs[0]._id,
          type: 'Investment',
          amount: 25000,
          plan: planDocs[2]._id,
          paymentMethod: 'Wallet Balance',
          status: 'Completed',
          description: 'Deployed into Balanced Wealth Accumulator',
          actionDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 120)
        },
        {
          transactionId: 'TXN-902147',
          user: customerDocs[0]._id,
          type: 'Withdrawal',
          amount: 15000,
          paymentMethod: 'Bank Wire',
          status: 'Pending',
          description: 'Quarterly dividend withdrawal request',
          actionDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1)
        },
        {
          transactionId: 'TXN-902148',
          user: customerDocs[1]._id,
          type: 'Deposit',
          amount: 100000,
          paymentMethod: 'UPI',
          status: 'Completed',
          description: 'Account balance addition',
          actionDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 245)
        },
        {
          transactionId: 'TXN-902149',
          user: customerDocs[2]._id,
          type: 'Deposit',
          amount: 200000,
          paymentMethod: 'Bank Transfer',
          status: 'Completed',
          description: 'High net-worth allocation deposit',
          actionDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 305)
        }
      ];

      for (const txn of transactions) {
        await Transaction.create(txn);
      }
      console.log('[Seeder] Initial platform transactions created');
    }

    // 6. Seed Notifications if none exist
    let notifsCount = await Notification.countDocuments();
    if (notifsCount === 0) {
      const notifs = [
        {
          recipient: null, // Broadcast to all
          title: 'Q4 Global Macro Investment Strategy Published',
          message: 'Admin has updated asset allocation weightings and introduced new High-Alpha tech strategies.',
          type: 'Announcement',
          createdBy: admin._id
        },
        {
          recipient: customerDocs[0]._id,
          title: 'Investment Active: Bluechip Alpha Growth',
          message: 'Your investment of $50,000 has been deployed and compounding is now active.',
          type: 'Investment'
        },
        {
          recipient: customerDocs[0]._id,
          title: 'Withdrawal Request Pending Admin Approval',
          message: 'Your withdrawal request of $15,000 (TXN-902147) is queued for administrator authorization.',
          type: 'Transaction'
        }
      ];

      for (const n of notifs) {
        await Notification.create(n);
      }
      console.log('[Seeder] Initial notifications seeded');
    }
  } catch (error) {
    console.warn('[Seeder] Error during initial database seed:', error.message);
  }
};
