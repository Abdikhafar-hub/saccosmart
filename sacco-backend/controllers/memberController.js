const User = require('../models/User');
const Contribution = require('../models/Contribution');
const Loan = require('../models/Loan');
const Member = require('../models/Member');

exports.getAllMembers = async (req, res) => {
  try {
    // You can filter by role if you want only members, e.g. { role: "member" }
    const members = await User.find();
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMemberLoanLimit = async (req, res) => {
  try {
    const userId = req.user.id;

    // --- Calculate Maximum Limit (Example: 3x total contributions) ---
    const totalContributions = await Contribution.aggregate([
      { $match: { user: userId, status: 'Verified' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalContribAmount = totalContributions.length > 0 ? totalContributions[0].total : 0;
    const maximumLimit = totalContribAmount * 3; // Example: 3x total contributions
    const basedOn = `3x total verified contributions (KES ${totalContribAmount.toLocaleString()})`;

    // --- Calculate Currently Used ---
    const activeLoans = await Loan.find({ user: userId, status: { $in: ['approved', 'active'] } });
    const currentlyUsed = activeLoans.reduce((sum, loan) => sum + (loan.amount || 0), 0);

    // --- Calculate Available Limit ---
    const available = maximumLimit - currentlyUsed;

    // --- Send Response ---
    res.json({
      maximumLimit,
      available,
      used: currentlyUsed,
      basedOn
    });
  } catch (err) {
    console.error('Get Member Loan Limit Error:', err);
    res.status(500).json({ error: 'Failed to fetch member loan limit data' });
  }
};

exports.getMemberById = async (req, res) => {
  try {
    const member = await User.findById(req.params.id).select('_id name email');
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    res.status(200).json(member);
  } catch (err) {
    console.error('Get Member By ID Error:', err);
    res.status(500).json({ error: 'Failed to fetch member' });
  }
};

exports.updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, joinDate, age } = req.body;

    const updatedMember = await User.findByIdAndUpdate(id, {
      name,
      email,
      joinDate: new Date(joinDate),
      dateOfBirth: new Date(new Date().setFullYear(new Date().getFullYear() - age)),
    }, { new: true });

    if (!updatedMember) {
      return res.status(404).json({ message: "Member not found" });
    }

    res.json({ message: "Member updated successfully", member: updatedMember });
  } catch (err) {
    res.status(500).json({ error: "Failed to update member details" });
  }
};

exports.updateMemberSettings = async (req, res) => {
  try {
    const updatedMember = await Member.findByIdAndUpdate(req.user.id, req.body, { new: true });
    if (!updatedMember) return res.status(404).send('Member not found.');
    res.send({ message: 'Member settings updated successfully.', member: updatedMember });
  } catch (err) {
    res.status(500).send('Server error.');
  }
};
