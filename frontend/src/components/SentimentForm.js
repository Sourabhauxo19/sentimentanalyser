import React, { useState } from 'react';

const SentimentForm = ({ onAnalyze }) => {
    const [text, setText] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);
        try {
            const res = await onAnalyze(text);
            setResult(res);
        } catch (err) {
            setResult({ sentiment: 'Error', timestamp: '' });
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Analyze Sentiment</h2>
            <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                required
            />
            <button type="submit" disabled={loading}>
                {loading ? 'Analyzing...' : 'Analyze'}
            </button>
            {result && (
                <div>
                    <strong>Sentiment:</strong> {result.sentiment}<br />
                    <strong>Timestamp:</strong> {result.timestamp}
                </div>
            )}
        </form>
    );
};

export default SentimentForm;