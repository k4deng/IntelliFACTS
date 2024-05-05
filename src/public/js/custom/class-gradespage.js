$(document).ready(() => {

    const catFormatting = new Intl.NumberFormat('en-US', {
        minimumIntegerDigits: 2,
        minimumFractionDigits: 2
    });

    const totalFormatting = new Intl.NumberFormat('en-US', {
        minimumIntegerDigits: 2,
        minimumFractionDigits: 3
    });

    const getPoints = (text) => {
        text = text === '' ? '0' : text; //if text is empty set it to 0
        text = text.replace('Pts:', ''); //remove text
        text = text.replace('Max:', '');
        text = text.split(' ').join(''); //remove spaces
        return parseFloat(text);
    }

    const formatGradeText = (element, newNumber, formattingElement) => {
        if (parseFloat(element.text()) === newNumber) return
        else element.append(`(${formattingElement.format(newNumber)})`);
    }

    //get each category
    let classGrade = 0;
    $('table.grades').each((index1, element1) => {
        let categoryData = { points: 0, totalPoints: 0 }

        //get each row / item in the category
        $(element1).find('tbody tr').each((index2, element2) => {
            if ($(element2).hasClass('cat_avg')) return; //skip average

            //get the points and total points from the row
            categoryData.points += getPoints($(element2).find('td.GBK_col2').text());
            categoryData.totalPoints += getPoints($(element2).find('td.GBK_col3').text());
        });

        //no items in the category
        if ($(element1).find('tbody tr').length === 0) categoryData = { points: 1, totalPoints: 1 };

        //calculate the average and turn it into a percent and round it to two decimals
        let catAvg = Math.round((categoryData.points / categoryData.totalPoints) * 10000) / 100;
        catAvg = catAvg > 100 ? 100 : catAvg; //if the average is over 100 set it to 100

        //add category avg with weight to class grade
        const catWeight = parseFloat($('table.grades').eq(index1).prev().find('div.grades_right').text().split(' ')[2]);
        const weightedCatAvg = (categoryData.points / categoryData.totalPoints) * (catWeight / 100)
        classGrade += weightedCatAvg > (catWeight / 100) ? (catWeight / 100) : weightedCatAvg;

        // add calculated category average to the page
        formatGradeText($(element1).find('tbody tr.cat_avg td.grade_data_center'), catAvg, catFormatting)
    });

    // add calculated class grade to the page
    formatGradeText($('div.card-body div.grades_middle').last(), (Math.round(classGrade * 100000) / 1000), totalFormatting)
})
