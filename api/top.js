export default async (req, res) => {
    const response = await fetch(`http://39.99.250.78:5222/get-top`);
    const data = await response.json();
    res.status(200).json(data);
};
