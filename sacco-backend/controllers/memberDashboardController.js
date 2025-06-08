const User = require('../models/User')
const Contribution = require('../models/Contribution')
const Loan = require('../models/Loan')

// Helper for age group
function getAgeGroup(age) {
  if (age >= 18 && age <= 25) return "18-25"
  if (age >= 26 && age <= 35) return "26-35"
  if (age >= 36 && age <= 45) return "36-45"
  if (age >= 46 && age <= 55) return "46-55"
  if (age >= 56) return "56+"
  return "Unknown"
}

exports.fullSummary = async (req, res) => {
  try {
    const members = await User.find({ role: "member" }).lean()
    const contributions = await Contribution.find({}).lean()
    const loans = await Loan.find({}).lean()

    const memberIdToContributions = {}
    contributions.forEach(c => {
      const uid = c.user.toString()
      if (!memberIdToContributions[uid]) memberIdToContributions[uid] = []
      memberIdToContributions[uid].push(c)
    })

    const now = new Date()
    const thisMonth = now.getMonth()
    const thisYear = now.getFullYear()

    let totalMembers = members.length
    let activeMembers = 0
    let pendingApproval = 0
    let inactiveMembers = 0
    let newThisMonth = 0
    let totalContributions = 0

    const membershipTypeCounts = {}
    const statusCounts = {}
    const ageGroupCounts = { "18-25": 0, "26-35": 0, "36-45": 0, "46-55": 0, "56+": 0 }
    const memberGrowthTrends = []

    // Member growth trends (last 6 months)
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const month = d.toLocaleString('default', { month: 'short' })
      const year = d.getFullYear()
      const newMembers = members.filter(m => {
        if (!m.joinDate) return false
        const jd = new Date(m.joinDate)
        return jd.getMonth() === d.getMonth() && jd.getFullYear() === d.getFullYear()
      }).length
      const totalToDate = members.filter(m => {
        if (!m.joinDate) return false
        const jd = new Date(m.joinDate)
        return jd.getFullYear() < year || (jd.getFullYear() === year && jd.getMonth() <= d.getMonth())
      }).length
      memberGrowthTrends.push({ name: month, new: newMembers, total: totalToDate })
    }

    const activeMembersTable = []
    members.forEach(m => {
      const memberContributions = memberIdToContributions[m._id?.toString()] || []
      const hasLoanApplication = loans.some(loan => loan.user.toString() === m._id.toString())
      const lastContribution = memberContributions.length > 0
        ? memberContributions.reduce((latest, c) => new Date(c.date) > new Date(latest.date) ? c : latest, memberContributions[0])
        : null
      const isActive = hasLoanApplication || memberContributions.length > 0

      if (isActive) activeMembers++
      else inactiveMembers++

      const type = m.membershipType || "Unknown"
      membershipTypeCounts[type] = (membershipTypeCounts[type] || 0) + 1

      const status = isActive ? "Active" : "Inactive"
      statusCounts[status] = (statusCounts[status] || 0) + 1

      if (m.dateOfBirth) {
        const dob = new Date(m.dateOfBirth)
        const age = now.getFullYear() - dob.getFullYear() - (now < new Date(now.getFullYear(), dob.getMonth(), dob.getDate()) ? 1 : 0)
        const group = getAgeGroup(age)
        ageGroupCounts[group] = (ageGroupCounts[group] || 0) + 1
      }

      const totalContrib = memberContributions.reduce((sum, c) => sum + (c.amount || 0), 0)
      const complianceRate = 100 // You can implement your own logic
      activeMembersTable.push({
        ...m,
        firstName: m.firstName || "",
        lastName: m.lastName || "",
        totalContributions: totalContrib,
        lastContribution: lastContribution ? lastContribution.date : null,
        complianceRate,
        currentBalance: m.currentBalance || 0,
        loanBalance: m.loanBalance || 0,
        status,
        hasLoanApplication,
      })
      totalContributions += totalContrib
    })

    const averageContribution = activeMembers > 0 ? Math.round(totalContributions / activeMembers) : 0

    res.json({
      stats: {
        totalMembers,
        activeMembers,
        pendingApproval,
        inactiveMembers,
        newThisMonth,
        averageContribution,
        retentionRate: 0,
        membershipGrowth: 0,
      },
      memberGrowthTrends,
      membershipTypes: Object.entries(membershipTypeCounts).map(([name, value]) => ({ name, value })),
      ageDistribution: Object.entries(ageGroupCounts).map(([name, value]) => ({ name, value })),
      memberStatusDistribution: Object.entries(statusCounts).map(([name, value]) => ({ name, value })),
      activeMembers: activeMembersTable,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
