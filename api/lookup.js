export default async (req, res) => {
    const { key } = req.query;
    const response = await fetch(`http://39.99.250.78:5222/lookup?key=${key}`);
    const data = await response.json();
    res.status(200).json(data);
};
